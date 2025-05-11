-- Add session fingerprinting and expiry
ALTER TABLE sessions 
ADD COLUMN fingerprint VARCHAR(255) NOT NULL AFTER token,
ADD COLUMN expiresAt DATETIME NOT NULL AFTER fingerprint,
ADD COLUMN lastActiveAt DATETIME NULL AFTER expiresAt;

-- Create login tracking table
CREATE TABLE IF NOT EXISTS login_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  ip VARCHAR(45) NOT NULL,
  userAgent VARCHAR(255) NULL,
  success BOOLEAN NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create security logs table for tracking security events
CREATE TABLE IF NOT EXISTS security_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  event VARCHAR(50) NOT NULL,
  details TEXT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Add last password change tracking
ALTER TABLE users
ADD COLUMN passwordLastChanged DATETIME NULL,
ADD COLUMN passwordResetRequired BOOLEAN DEFAULT 0,
ADD COLUMN loginAttempts INT DEFAULT 0,
ADD COLUMN lockedUntil DATETIME NULL;

-- Create separate permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
);

-- Create user permissions join table
CREATE TABLE IF NOT EXISTS user_permissions (
  userId INT NOT NULL,
  permissionId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userId, permissionId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE
);