const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: any }) => {
  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[var(--color-neutral)] p-6 rounded-lg max-w-md w-full">
        {children}
        <button onClick={onClose} class="mt-4 text-[var(--color-primary)] hover:underline">Close</button>
      </div>
    </div>
  );
};

export default Modal;
