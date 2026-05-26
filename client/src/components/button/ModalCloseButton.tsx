import type { FC } from "react";

interface ModalCloseButtonProps {
  onClose: () => void;
}

const ModalCloseButton: FC<ModalCloseButtonProps> = ({ onClose }) => {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-999 flex h-9.5 w-9.5 items-center
     justify-center rounded-full bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:h-11
     sm:w-11 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}           // ✅ Changed from stroke-width
          strokeLinecap="round"     // ✅ Changed from stroke-linecap
          strokeLinejoin="round"    // ✅ Changed from stroke-linejoin
        >
          <path d="M18 6L6 18M6 6L18 18"></path>
        </svg>
      </button>
    </>
  );
};

export default ModalCloseButton;