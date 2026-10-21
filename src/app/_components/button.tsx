interface NewButtonProps {
  buttonText?: string;
  onClick?: () => void;
}

export default function NewButton({ buttonText = "+ New Project", onClick, ...props }: NewButtonProps) {
  return (
    <button
      onClick={onClick}
      {...props}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
      {buttonText}
    </button>
  );
}