import React, { useEffect, useRef, HTMLAttributes } from 'react';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}

const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({
  isOpen,
  onClose,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className = '',
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`relative bg-white rounded-lg shadow-xl w-full ${sizeStyles[size]} ${className}`.trim()}
        tabIndex={-1}
        {...props}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg p-1"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 ${className}`.trim()}
      {...props}
    >
      {title ? (
        <h2 className="text-xl font-semibold text-gray-900 pr-8">{title}</h2>
      ) : (
        children
      )}
    </div>
  );
};

const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`px-6 py-4 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  divided = true,
  className = '',
  ...props
}) => {
  const dividerStyle = divided ? 'border-t border-gray-200' : '';

  return (
    <div
      className={`px-6 py-4 ${dividerStyle} flex items-center justify-end gap-3 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

Modal.displayName = 'Modal';
ModalHeader.displayName = 'Modal.Header';
ModalBody.displayName = 'Modal.Body';
ModalFooter.displayName = 'Modal.Footer';

export default Modal;
