mod db;

use rusqlite::{Connection, params, Row};
use serde::Deserialize;
use serde::Serialize;
use std::sync::Mutex;
use tauri::{Manager, State};
use anyhow::Result;

use d1_yesno::D1;

pub struct Db(pub Mutex<Connection>);

// start project data structures
#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    id: i64,
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewProject {
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteProject {
    id: i64,
}

// end project data structures

// start task data structures

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    id: i64,
    project_id: i64,
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewTask {
    // id is associated project id when creating a new task
    parent_id: i64,
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteTask {
    id: i64,
}

// end task data structures

// start response data structures

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Response {
    id: i64,
    task_id: i64,
    response_label: String,
    response_text: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewResponse {
    response_label: String,
    response_text: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewResponsePair {
    task_id: i64,
    response_a: NewResponse,
    response_b: NewResponse,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteResponse {
    id: i64,
}

// end response data structures

// start flag data structures

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Flag {
    id: i64,
    response_id: i64,
    sentence_text: String,
    flag_type: String,
    flag_resolution: String,
    reasoning_note: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewFlag {
    response_id: i64,
    sentence_text: String,
    flag_type: String,
    flag_resolution: String,
    reasoning_note: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteFlag {
    id: i64,
}

// end flag data structures

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
enum Item {
    Project(Project),
    Task(Task),
    Response(Response),
    Flag(Flag),
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
enum NewItem {
    Project(NewProject),
    Task(NewTask),
    Flag(NewFlag),
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
enum RemoveItem {
    Project(DeleteProject),
    Task(DeleteTask),
    Response(DeleteResponse),
    Flag(DeleteFlag),
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
enum ListKind {
    Project,
    Task,
    Response,
    Flag,
}

impl ListKind {
    /// Every kind except Project needs a parent id to filter on.
    fn parent_id(&self, parent_id: Option<i64>) -> Result<i64, String> {
        parent_id.ok_or_else(|| format!("parent_id is required when listing {:?}", self))
    }
}

pub struct AppState {
    model: Mutex<Option<D1>>,
}

impl AppState {
    /// Plain Rust API — callable from anywhere that can reach the state.
    pub fn decide(&self, claim_state: &str, instructions: &str) -> Result<f32, String> {
        let mut g = self.model.lock().map_err(|e| e.to_string())?;
        let d1 = g.as_mut().ok_or("model not loaded — call ensure_model first")?;
        d1.yes_no(claim_state, instructions).map_err(|e| e.to_string())
    }
}

#[tauri::command]
async fn ensure_model(state: State<'_, AppState>) -> Result<(), String> {
    let mut g = state.model.lock().map_err(|e| e.to_string())?;
    if g.is_some() {
        return Ok(());
    }
    let d1 = d1_yesno::D1::new().map_err(|e| e.to_string())?;
    *g = Some(d1);
    Ok(())
}

#[tauri::command]
fn add_item(state: tauri::State<Db>, item: NewItem) -> Result<i64, String> {
    let conn = state.0.lock().unwrap();
    match item {
        NewItem::Project(project) => {
            conn.execute("INSERT INTO projects (projectName) VALUES (?1)", params![project.name])
                .map(|_| conn.last_insert_rowid())
                .map_err(|e| e.to_string())
        }
        NewItem::Task(task) => {
            conn.execute("INSERT INTO tasks (projectId, taskName) VALUES (?1, ?2)", params![task.parent_id, task.name])
                .map(|_| conn.last_insert_rowid())
                .map_err(|e| e.to_string())
        }
        NewItem::Flag(flag) => {
            conn.execute("INSERT INTO flags (responseId, sentenceData, flagType, flagResolution, reasoningNote) VALUES (?1, ?2, ?3, ?4, ?5)", params![flag.response_id, flag.sentence_text, flag.flag_type, flag.flag_resolution, flag.reasoning_note])
                .map(|_| conn.last_insert_rowid())
                .map_err(|e| e.to_string())
        }
    }
}

fn generate_flags(model: &AppState, response: Response) -> Result<Vec<NewFlag>, String> {
    let response_id = response.id;

    // flag type auto since these flags are generated by d1
    let flag_type = "auto";

    // user has not acted on the flags freshly generated, so they are unresolved
    let flag_resolution = "unresolved";

    // no reasoning since users have not made any notes yet (empty string for now)
    let reasoning_note = "";

    let llm_text = response.response_text;

    let sentences = llm_text.split_inclusive(&['.', '!', '?']);

    let mut flags = <Vec<NewFlag>>::new();

    // set prompt
    let question_prompt = "Does the sentence require a data annotator to find a proper citation?";

    // hardcode prob threshold for now (maybe user adjustable via gui in the future?)
    let prob_threshold = 0.3;

    for sentence in sentences {
        let sentence_text = sentence.trim();

        let decision = model.decide(
            sentence,
            question_prompt,
        ).map_err(|e| e.to_string())?;

        if decision > prob_threshold {
            let flag = NewFlag {
                response_id,
                sentence_text: sentence_text.to_string(),
                flag_type: flag_type.to_string(),
                flag_resolution: flag_resolution.to_string(),
                reasoning_note: reasoning_note.to_string(),
            };

            flags.push(flag);
        }
    }

    Ok(flags)
}

fn add_response_pair(state: tauri::State<Db>, pair: NewResponsePair) -> Result<(i64, i64), String> {
    let conn = state.0.lock().unwrap();

    let associated_task_id = pair.task_id;

    let response_a = &pair.response_a;
    let response_b = &pair.response_b;

    let response_a_id = conn.execute(
        "INSERT INTO responses (taskId, responseLabel, responseText) VALUES (?1, ?2, ?3)",
        params![associated_task_id, "A", response_a.response_text],
    )
    .map(|_| conn.last_insert_rowid())
    .map_err(|e| e.to_string())?;

    let response_b_id = conn.execute(
        "INSERT INTO responses (taskId, responseLabel, responseText) VALUES (?1, ?2, ?3)",
        params![associated_task_id, "B", response_b.response_text],
    )
    .map(|_| conn.last_insert_rowid())
    .map_err(|e| e.to_string())?;

    Ok((response_a_id, response_b_id))
}

fn add_generated_flags(state: tauri::State<Db>, response_a_flags: Vec<NewFlag>, response_b_flags: Vec<NewFlag>) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    
    for flag in response_a_flags {
        conn.execute("INSERT INTO flags (responseId, sentenceText, flagType, flagResolution, reasoningNote) VALUES (?1, ?2, ?3, ?4, ?5)", params![flag.response_id, flag.sentence_text, flag.flag_type, flag.flag_resolution, flag.reasoning_note])
            .map(|_| ())
            .map_err(|e| e.to_string())?;
    }

    for flag in response_b_flags {
        conn.execute("INSERT INTO flags (responseId, sentenceText, flagType, flagResolution, reasoningNote) VALUES (?1, ?2, ?3, ?4, ?5)", params![flag.response_id, flag.sentence_text, flag.flag_type, flag.flag_resolution, flag.reasoning_note])
            .map(|_| ())
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
async fn add_response_pair_and_generate(state: tauri::State<'_, Db>, model: tauri::State<'_, AppState>, pair: NewResponsePair) -> Result<(i64, i64), String> {
    let task_id = pair.task_id;

    let response_a_text = pair.response_a.response_text.clone();
    let response_b_text = pair.response_b.response_text.clone();
    
    let (response_a_id, response_b_id) = add_response_pair(state.clone(), pair)?;

    // generate flags for response A
    let response_a_wrapped = Response {
        id: response_a_id,
        task_id: task_id,
        response_label: "A".to_string(),
        response_text: response_a_text,
    };
    let response_a_flags = generate_flags(&model, response_a_wrapped)?;

    let response_b_wrapped = Response {
        id: response_b_id,
        task_id: task_id,
        response_label: "B".to_string(),
        response_text: response_b_text,
    };
    let response_b_flags = generate_flags(&model, response_b_wrapped)?;

    println!("Generated {} flags for response A", response_a_flags.len());
    println!("Generated {} flags for response B", response_b_flags.len());

    add_generated_flags(state.clone(), response_a_flags, response_b_flags)?;

    Ok((response_a_id, response_b_id))
}

#[tauri::command]
fn delete_item(state: tauri::State<Db>, item: RemoveItem) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    match item {
        RemoveItem::Project(project) => {
            conn.execute("DELETE FROM projects WHERE projectId = ?1", params![project.id])
                .map(|_| ())
                .map_err(|e| e.to_string())
        }
        RemoveItem::Task(task) => {
            conn.execute("DELETE FROM tasks WHERE taskId = ?1", params![task.id])
                .map(|_| ())
                .map_err(|e| e.to_string())
        }
        RemoveItem::Response(response) => {
            conn.execute("DELETE FROM responses WHERE responseId = ?1", params![response.id])
                .map(|_| ())
                .map_err(|e| e.to_string())
        }
        RemoveItem::Flag(flag) => {
            conn.execute("DELETE FROM flags WHERE flagId = ?1", params![flag.id])
                .map(|_| ())
                .map_err(|e| e.to_string())
        }
    }
}

fn query_all<T, F>(
    conn: &Connection,
    sql: &str,
    params: impl rusqlite::Params,
    map: F,
    ) -> Result<Vec<T>, String>
    where
        F: FnMut(&Row<'_>) -> rusqlite::Result<T>,
    {
        let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
        stmt.query_map(params, map)
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())
}

#[tauri::command]
fn list_items(
    state: tauri::State<Db>,
    kind: ListKind,
    parent_id: Option<i64>,
) -> Result<Vec<Item>, String> {
    let conn = state.0.lock().unwrap();
    match kind {
        ListKind::Project => query_all(
            &conn,
            "SELECT projectId, projectName FROM projects ORDER BY projectId",
            [],
            |row| {
                Ok(Item::Project(Project {
                    id: row.get(0)?,
                    name: row.get(1)?,
                }))
            },
        ),
        ListKind::Task => {
            let project_id = kind.parent_id(parent_id)?;
            query_all(
                &conn,
                "SELECT taskId, projectId, taskName FROM tasks WHERE projectId = ?1 ORDER BY taskId",
                [&project_id],
                |row| {
                    Ok(Item::Task(Task {
                        id: row.get(0)?,
                        project_id: row.get(1)?,
                        name: row.get(2)?,
                    }))
                },
            )
        }
        ListKind::Response => {
            let task_id = kind.parent_id(parent_id)?;
            query_all(
                &conn,
                "SELECT responseId, taskId, responseLabel, responseText FROM responses WHERE taskId = ?1 ORDER BY responseLabel DESC",
                [&task_id],
                |row| {
                    Ok(Item::Response(Response {
                        id: row.get(0)?,
                        task_id: row.get(1)?,
                        response_label: row.get(2)?,
                        response_text: row.get(3)?,
                    }))
                },
            )
        }
        ListKind::Flag => {
            let response_id = kind.parent_id(parent_id)?;
            query_all(
                &conn,
                "SELECT flagId, responseId, sentenceText, flagType, flagResolution, reasoningNote FROM flags WHERE responseId = ?1 ORDER BY flagId",
                [&response_id],
                |row| {
                    Ok(Item::Flag(Flag {
                        id: row.get(0)?,
                        response_id: row.get(1)?,
                        sentence_text: row.get(2)?,
                        flag_type: row.get(3)?,
                        flag_resolution: row.get(4)?,
                        reasoning_note: row.get(5)?,
                    }))
                },
            )
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      let dir = app.path().app_data_dir()?;
      std::fs::create_dir_all(&dir)?;

      // open connection
      let conn = db::open(&dir.join("app.db"))?;
      db::init(&conn)?;

      app.manage(Db(Mutex::new(conn)));
      app.manage(AppState {
        model: Mutex::new(None),
      });
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![ensure_model, add_item, add_response_pair_and_generate, delete_item, list_items])
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}