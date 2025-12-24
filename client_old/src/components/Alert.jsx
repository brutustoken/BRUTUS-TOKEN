import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * Alert Component - Modern implementation with React Hooks
 * Displays modal alerts with title and message
 * @param {Object} props - Component props
 * @param {string} props.title - Alert title (default: "Alert")
 * @param {string} props.message - Alert message content
 * @param {string} props.type - Alert type: 'info', 'success', 'warning', 'error' (default: 'info')
 * @param {boolean} props.autoShow - Auto show modal when message changes (default: true)
 * @param {function} props.onClose - Callback when modal is closed
 */
const Alert = ({ 
  title = "Alert", 
  message = "", 
  type = "info",
  autoShow = true,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentTitle, setCurrentTitle] = useState(title);
  const previousMessageRef = useRef("");
  const modalRef = useRef(null);

  // Alert type configurations
  const alertConfig = {
    info: {
      icon: "bi bi-info-circle-fill",
      color: "text-primary",
      bgColor: "bg-primary-subtle"
    },
    success: {
      icon: "bi bi-check-circle-fill",
      color: "text-success",
      bgColor: "bg-success-subtle"
    },
    warning: {
      icon: "bi bi-exclamation-triangle-fill",
      color: "text-warning",
      bgColor: "bg-warning-subtle"
    },
    error: {
      icon: "bi bi-x-circle-fill",
      color: "text-danger",
      bgColor: "bg-danger-subtle"
    }
  };

  const config = alertConfig[type] || alertConfig.info;

  // Show modal function
  const showModal = useCallback(() => {
    if (modalRef.current) {
      const modal = new window.bootstrap.Modal(modalRef.current);
      modal.show();
      setIsVisible(true);
    }
  }, []);

  // Hide modal function
  const hideModal = useCallback(() => {
    if (modalRef.current) {
      const modalInstance = window.bootstrap.Modal.getInstance(modalRef.current);
      if (modalInstance) {
        modalInstance.hide();
      }
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }
  }, [onClose]);

  // Handle message changes
  useEffect(() => {
    if (message && message !== previousMessageRef.current) {
      setCurrentMessage(message);
      setCurrentTitle(title);
      previousMessageRef.current = message;
      
      if (autoShow) {
        showModal();
      }
    }
  }, [message, title, autoShow, showModal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (modalRef.current) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalRef.current);
        if (modalInstance) {
          modalInstance.dispose();
        }
      }
    };
  }, []);

  // Handle manual show button click
  const handleShowLastMessage = () => {
    if (currentMessage) {
      showModal();
    }
  };

  return (
    <>
      {/* Show last message button - only visible if there's a message */}
      {currentMessage && (
        <button 
          type="button" 
          className="btn btn-primary btn-sm"
          onClick={handleShowLastMessage}
          aria-label="Show last message"
        >
          <i className="bi bi-bell-fill me-2"></i>
          See Last Message
        </button>
      )}

      {/* Modal */}
      <div 
        className="modal fade" 
        id="alert" 
        ref={modalRef}
        tabIndex="-1" 
        aria-labelledby="alertModalLabel" 
        aria-hidden="true"
        data-bs-backdrop="static"
        data-bs-keyboard="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className={`modal-header ${config.bgColor}`}>
              <h5 className={`modal-title d-flex align-items-center ${config.color}`} id="alertModalLabel">
                <i className={`${config.icon} me-2`}></i>
                {currentTitle}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close"
                onClick={hideModal}
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {currentMessage}
              </p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                data-bs-dismiss="modal"
                onClick={hideModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Alert;