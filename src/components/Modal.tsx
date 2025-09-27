import type { ReactNode } from "react";

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
                <button onClick={onClose} className="float-right text-gray-500">✖</button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
