import { useEffect, useState, useRef, type FC, type ReactNode } from "react";
import { createPortal } from "react-dom";
import ModalCloseButton from "../button/ModalCloseButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  isfullscreen?: boolean;
  size?: "small" | "medium" | "large" | "xl";
}

const CLOSE_DELAY = 200;

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  className,
  children,
  showCloseButton = false,
  isfullscreen = false,
  size = "medium",
}) => {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // One stable container div that lives for the entire lifetime of this
  // Modal instance. Using document.body directly as the portal target
  // causes React's reconciler to lose track of the node during unmount,
  // producing the "removeChild: node is not a child" crash.
  const containerRef = useRef<HTMLDivElement | null>(null);
  if (!containerRef.current) {
    containerRef.current = document.createElement("div");
    containerRef.current.setAttribute("data-modal-container", "true");
  }

  // Attach / detach the container from the DOM alongside visibility
  useEffect(() => {
    const container = containerRef.current!;
    if (isOpen) {
      if (!document.body.contains(container)) {
        document.body.appendChild(container);
      }
      setVisible(true);
      requestAnimationFrame(() => setAnimating(true));
    } else {
      setAnimating(false);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      }, CLOSE_DELAY);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  // Clean up container on unmount
  useEffect(() => {
    return () => {
      const container = containerRef.current;
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  // Keyboard + scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!visible) return null;

  const sizeClasses = {
    small: "w-full max-w-md",
    medium: "w-full max-w-2xl",
    large: "w-full max-w-4xl",
    xl: "w-full max-w-6xl",
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
      style={{
        transition: `opacity ${CLOSE_DELAY}ms ease`,
        opacity: animating ? 1 : 0,
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          relative
          ${isfullscreen ? "w-full h-full" : sizeClasses[size]}
          bg-white
          rounded-lg
          shadow-2xl
          z-10
          max-h-[90vh]
          flex
          flex-col
          ${className ?? ""}
        `}
        style={{
          transition: `transform ${CLOSE_DELAY}ms ease, opacity ${CLOSE_DELAY}ms ease`,
          transform: animating ? "scale(1)" : "scale(0.97)",
          opacity: animating ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && <ModalCloseButton onClose={onClose} />}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, containerRef.current);
};

export default Modal;