mod db;

use rusqlite::{Connection, params, Row};
use serde::Deserialize;
use serde::Serialize;
use std::sync::Mutex;
use tauri::Manager;

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
pub struct Task {
    id: i64,
    project_id: i64,
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewTask {
    project_id: i64,
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteTask {
    id: i64,
}

// end task data structures

// start response data structures

#[derive(Debug, Serialize, Deserialize)]
pub struct Response {
    id: i64,
    task_id: i64,
    response_label: String,
    response_data: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewResponse {
    task_id: i64,
    response_label: String,
    response_data: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteResponse {
    id: i64,
}

// end response data structures

// start flag data structures

#[derive(Debug, Serialize, Deserialize)]
pub struct Flag {
    id: i64,
    response_id: i64,
    sentence_data: String,
    flag_type: String,
    flag_resolution: String,
    reasoning_note: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewFlag {
    response_id: i64,
    sentence_data: String,
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
    Response(NewResponse),
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
            conn.execute("INSERT INTO tasks (projectId, taskName) VALUES (?1, ?2)", params![task.project_id, task.name])
                .map(|_| conn.last_insert_rowid())
                .map_err(|e| e.to_string())
        }
        NewItem::Response(response) => {
            conn.execute("INSERT INTO responses (taskId, responseLabel, responseData) VALUES (?1, ?2, ?3)", params![response.task_id, response.response_label, response.response_data])
                .map(|_| conn.last_insert_rowid())
                .map_err(|e| e.to_string())
        }
        NewItem::Flag(flag) => {
            conn.execute("INSERT INTO flags (responseId, sentenceData, flagType, flagResolution, reasoningNote) VALUES (?1, ?2, ?3, ?4, ?5)", params![flag.response_id, flag.sentence_data, flag.flag_type, flag.flag_resolution, flag.reasoning_note])
                .map(|_| conn.last_insert_rowid())
                .map_err(|e| e.to_string())
        }
    }
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
                "SELECT responseId, taskId, responseLabel, responseData FROM responses WHERE taskId = ?1 ORDER BY responseId",
                [&task_id],
                |row| {
                    Ok(Item::Response(Response {
                        id: row.get(0)?,
                        task_id: row.get(1)?,
                        response_label: row.get(2)?,
                        response_data: row.get(3)?,
                    }))
                },
            )
        }
        ListKind::Flag => {
            let response_id = kind.parent_id(parent_id)?;
            query_all(
                &conn,
                "SELECT flagId, responseId, sentenceData, flagType, flagResolution, reasoningNote FROM flags WHERE responseId = ?1 ORDER BY flagId",
                [&response_id],
                |row| {
                    Ok(Item::Flag(Flag {
                        id: row.get(0)?,
                        response_id: row.get(1)?,
                        sentence_data: row.get(2)?,
                        flag_type: row.get(3)?,
                        flag_resolution: row.get(4)?,
                        reasoning_note: row.get(5)?,
                    }))
                },
            )
        }
    }
}


// #[tauri::command]
// fn list_projects(state: tauri::State<Db>) -> Result<Vec<Project>, String> {
//     let conn = state.0.lock().unwrap();
//     let mut stmt = conn
//         .prepare("SELECT projectId, projectName FROM projects ORDER BY projectId")
//         .map_err(|e| e.to_string())?;

//     let rows = stmt
//         .query_map([], |row| {
//             Ok(Project {
//                 id: row.get(0)?,
//                 name: row.get(1)?,
//             })
//         })
//         .map_err(|e| e.to_string())?
//         .collect::<Result<Vec<_>, _>>()
//         .map_err(|e| e.to_string())?;

//     Ok(rows)
// }

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
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![add_item, delete_item, list_items])
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}