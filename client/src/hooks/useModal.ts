import { useCallback, useState } from "react";

export const useModal = <T,>(initialState: boolean) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openModal = useCallback((item?: T | null) => {
    setSelectedItem(item || null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedItem(null);
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, selectedItem, openModal, closeModal, toggleModal };
};
