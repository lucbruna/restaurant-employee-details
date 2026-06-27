-- Updated to MySQL syntax
-- Create the restaurant_workers table
CREATE TABLE IF NOT EXISTS restaurant_workers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  position VARCHAR(50) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create an index on email for faster lookups
CREATE INDEX idx_restaurant_workers_email ON restaurant_workers(email);

-- Create an index on position for filtering
CREATE INDEX idx_restaurant_workers_position ON restaurant_workers(position);

-- Insert some sample data (optional)
INSERT INTO restaurant_workers (first_name, last_name, email, phone, position, hourly_rate, start_date) VALUES
  ('Maria', 'Garcia', 'maria.garcia@restaurant.com', '(555) 123-4567', 'chef', 28.50, '2024-01-15'),
  ('James', 'Wilson', 'james.wilson@restaurant.com', '(555) 234-5678', 'server', 15.00, '2024-02-20'),
  ('Sarah', 'Johnson', 'sarah.johnson@restaurant.com', '(555) 345-6789', 'manager', 32.00, '2023-11-01')
ON DUPLICATE KEY UPDATE first_name = first_name;
