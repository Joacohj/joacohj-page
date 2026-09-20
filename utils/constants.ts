export const mailBody = {
    from: { name: "Mailtrap Test", email: "sender@example.com" },
    to: [{ email: "recipient@example.com" }],
    subject: "Hello from Mailtrap Node.js",
    text: "Plain text body",
  }

export type FileSize = "small" | "medium" | "large";

export const SOCIAL_MEDIA = {
  youtube: '',
  instagram: '',
  x: '',
  github: 'https://github.com/Joacohj',
  linkedin: '',
  discord: ''
}

export const MAX_FILES = 4;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB