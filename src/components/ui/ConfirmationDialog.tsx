import React from 'react';
import Button from './Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'border-red-500',
    warning: 'border-yellow-500',
    info: 'border-blue-500'
  };

  const buttonVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`bg-gray-800 border-l-4 ${variantStyles[variant]} rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden`}>
        <div className="p-4">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <p className="mt-2 text-sm text-gray-300">{message}</p>
        </div>
        <div className="px-4 py-3 bg-gray-900 flex justify-end space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={buttonVariant}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
