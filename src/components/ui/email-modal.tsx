import { useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useLanguage } from "@/components/ui/LanguageContext";
import * as styles from "./email-modal.css";

interface EmailModalProps {
  onClose: () => void;
  recipientEmail: string;
}

export function EmailModal({ onClose, recipientEmail }: EmailModalProps) {
  const { language, translate } = useLanguage();
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Esc key down listner to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!senderEmail || !subject || !message) {
      setError(translate("emailModalErrorFields"));
      return;
    }

    if (!validateEmail(senderEmail)) {
      setError(translate("emailModalErrorEmail"));
      return;
    }

    setIsSending(true);

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // Fallback if environment variables are not set
    if (!serviceId || !templateId || !publicKey) {
      console.warn("EmailJS keys are missing. Falling back to mailto client.");
      
      const emailBody = `Sender: ${senderEmail}\n\nMessage:\n${message}`;
      const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(emailBody)}`;

      window.location.href = mailtoUrl;
      setIsSending(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 1000);
      return;
    }

    const templateParams = {
      email: senderEmail,
      name: senderEmail.split("@")[0],
      title: subject,
      message: message,
      to_email: recipientEmail,
    };

    emailjs
      .send(serviceId, templateId, templateParams, publicKey)
      .then(
        () => {
          setIsSending(false);
          setIsSuccess(true);
          setTimeout(() => {
            onClose();
          }, 1500);
        },
        (err) => {
          setIsSending(false);
          setError(
            language === "ko"
              ? "이메일 전송에 실패했습니다. 나중에 다시 시도해 주세요."
              : "Failed to send email. Please try again later."
          );
          console.error("EmailJS Error:", err);
        }
      );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-modal-title"
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 id="email-modal-title" className={styles.modalTitle}>
            {translate("emailModalTitle")}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={translate("closeModal")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Sender Email */}
            <div className={styles.formField}>
              <label htmlFor="sender-email" className={styles.formLabel}>
                {translate("emailModalSender")}
              </label>
              <input
                id="sender-email"
                type="email"
                className={styles.formInput}
                placeholder={translate("placeholderEmail")}
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                disabled={isSending || isSuccess}
                required
              />
            </div>

            {/* Subject */}
            <div className={styles.formField}>
              <label htmlFor="email-subject" className={styles.formLabel}>
                {translate("emailModalSubject")}
              </label>
              <input
                id="email-subject"
                type="text"
                className={styles.formInput}
                placeholder={translate("emailModalSubjectPlaceholder")}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSending || isSuccess}
                required
              />
            </div>

            {/* Message Body */}
            <div className={styles.formField}>
              <label htmlFor="email-message" className={styles.formLabel}>
                {translate("emailModalMessage")}
              </label>
              <textarea
                id="email-message"
                className={styles.formTextarea}
                placeholder={translate("emailModalMessagePlaceholder")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending || isSuccess}
                required
              />
            </div>

            {/* Validation & Feedback Messages */}
            {error && <div className={styles.errorMsg}>{error}</div>}
            {isSuccess && (
              <div className={styles.successMsg}>
                {translate("emailModalSuccess")}
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSending || isSuccess}
            >
              {translate("closeModal")}
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSending || isSuccess}
            >
              <Send size={14} />
              {isSending
                ? translate("emailModalSending")
                : translate("emailModalSend")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
