interface NewButtonProps {
  buttonText?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function NewButton({ buttonText = "+ New Project", onClick, disabled, ...props }: NewButtonProps) {
  return (
    <button
      onClick={onClick}
      {...props}
      disabled={disabled ?? false}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition
        enabled:hover:bg-blue-500
        enabled:cursor-pointer
        enabled:active:bg-blue-700
        enabled:focus:outline-none enabled:focus:ring-2 enabled:focus:ring-blue-500 enabled:focus:ring-offset-2 enabled:focus:ring-offset-gray-900
        disabled:cursor-not-allowed disabled:opacity-50"
    >
      {buttonText}
    </button>
  );
}