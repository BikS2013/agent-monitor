import React from 'react';
import LoginForm from './LoginForm';
import { useRepositories } from '../../context/RepositoryContext';

interface ApiLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal dialog for API login
 */
export const ApiLoginModal: React.FC<ApiLoginModalProps> = ({ isOpen, onClose }) => {
  const { initialize } = useRepositories();

  const handleLoginSuccess = async () => {
    // Reinitialize repositories with API data source
    try {
      await initialize();
      onClose();
      
      // Reload the application to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to initialize repositories after login:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="relative bg-white rounded-lg shadow">
          <button
            type="button"
            className="absolute top-3 right-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5"
            onClick={onClose}
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          
          <div className="p-6">
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiLoginModal;