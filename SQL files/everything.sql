CREATE DATABASE company;
use company;

CREATE TABLE employee1 (
    emp_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    location VARCHAR(100) NOT NULL,
    manager_id INT UNSIGNED,  
    FOREIGN KEY (manager_id) REFERENCES employee(emp_id) ON DELETE SET NULL
) AUTO_INCREMENT = 10011;  -- Set emp_id to start at 10011

-- Set sequence to start at 10011

-- Insert Employees
INSERT INTO employee1 (password, name, designation, salary, location, manager_id) VALUES
('pass123', 'John Doe', 'Manager', 90000.00, 'Vijayawada', NULL), -- Manager (No manager_id)
('pass456', 'Alice Smith', 'Casheir', 70000.00, 'Vijayawada', 10011),
('pass789', 'Bob Johnson', 'Casheir', 72000.00, 'Vijayawada', 10011),
('pass321', 'Charlie Brown', 'Casheir', 65000.00, 'Vijayawada', 10011),
('pass654', 'Diana Prince', 'Casheir', 60000.00, 'Vijayawada', 10011);

-- View Employees
SELECT * FROM employee1;
SELECT * FROM employee1 WHERE emp_id = '10011';


CREATE TABLE time_off_requests1 (
    request_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    emp_id INT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Denied') DEFAULT 'Pending',
    manager_id INT UNSIGNED,
    FOREIGN KEY (emp_id) REFERENCES employee2(emp_id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES employee2(emp_id) ON DELETE SET NULL
);

ALTER TABLE employee1 ADD COLUMN email VARCHAR(255) UNIQUE;
DELIMITER $$

CREATE TRIGGER before_employee1_insert
BEFORE INSERT ON employee1
FOR EACH ROW
BEGIN
    DECLARE random_suffix INT;

    -- Generate a random number between 100 and 999
    SET random_suffix = FLOOR(100 + (RAND() * 900));

    -- Assign email as firstname_random.nexus@gmail.com
    SET NEW.email = CONCAT(LOWER(SUBSTRING_INDEX(NEW.name, ' ', 1)), random_suffix, '.nexus@gmail.com');
END $$

DELIMITER ;
select * from employee1;
UPDATE employee1 
SET email = CONCAT(
    LOWER(SUBSTRING_INDEX(name, ' ', 1)), 
    FLOOR(100 + (RAND() * 900)), 
    '.nexus@gmail.com'
) 
WHERE emp_id IS NOT NULL;


-- Handle duplicates by using the full name
UPDATE employee1 e1
JOIN (
    SELECT email, COUNT(*) AS count FROM employee1 GROUP BY email HAVING count > 1
) e2 ON e1.email = e2.email
SET e1.email = CONCAT(LOWER(REPLACE(name, ' ', '')), '.nexus@gmail.com');
CREATE TABLE employee2 (
    emp_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    location VARCHAR(100) NOT NULL,
    address VARCHAR(255),  -- Added address column
    email VARCHAR(255) UNIQUE,  -- Added email column
    manager_id INT UNSIGNED,  
    FOREIGN KEY (manager_id) REFERENCES employee2(emp_id) ON DELETE SET NULL
) AUTO_INCREMENT = 10011;  -- Start emp_id from 10011
INSERT INTO employee2 (password, name, designation, salary, location, address, email, manager_id) VALUES
('pass123', 'John Doe', 'Manager', 90000.00, 'Vijayawada', '123 Street, Vijayawada', CONCAT(LOWER(SUBSTRING_INDEX('John Doe', ' ', 1)), FLOOR(100 + (RAND() * 900)), '.nexus@gmail.com'), NULL),
('pass456', 'Alice Smith', 'Cashier', 70000.00, 'Vijayawada', '456 Road, Vijayawada', CONCAT(LOWER(SUBSTRING_INDEX('Alice Smith', ' ', 1)), FLOOR(100 + (RAND() * 900)), '.nexus@gmail.com'), 10011),
('pass789', 'Bob Johnson', 'Cashier', 72000.00, 'Vijayawada', '789 Avenue, Vijayawada', CONCAT(LOWER(SUBSTRING_INDEX('Bob Johnson', ' ', 1)), FLOOR(100 + (RAND() * 900)), '.nexus@gmail.com'), 10011),
('pass321', 'Charlie Brown', 'Cashier', 65000.00, 'Vijayawada', '1010 Lane, Vijayawada', CONCAT(LOWER(SUBSTRING_INDEX('Charlie Brown', ' ', 1)), FLOOR(100 + (RAND() * 900)), '.nexus@gmail.com'), 10011),
('pass654', 'Diana Prince', 'Cashier', 60000.00, 'Vijayawada', '2020 Boulevard, Vijayawada', CONCAT(LOWER(SUBSTRING_INDEX('Diana Prince', ' ', 1)), FLOOR(100 + (RAND() * 900)), '.nexus@gmail.com'), 10011);
SELECT* from employee2;
ALTER TABLE employee2 ADD COLUMN last_paid_salary DATE;
UPDATE employee2 SET name='Anjana' WHERE emp_id = 10011;
UPDATE employee2 SET last_paid_salary = '2024-02-28' WHERE emp_id = 10012;
UPDATE employee2 SET last_paid_salary = '2024-02-28' WHERE emp_id = 10013;
UPDATE employee2 SET last_paid_salary = '2024-02-28' WHERE emp_id = 10014;
UPDATE employee2 SET last_paid_salary = '2024-02-28' WHERE emp_id = 10015;
UPDATE employee2 SET last_paid_salary = '2024-02-28';
UPDATE employee2 SET name='Suryansh' WHERE emp_id = 10012;
UPDATE employee2 SET name='Akshat Sao' WHERE emp_id = 10013;
UPDATE employee2 SET name='Teja Prasad' WHERE emp_id = 10014;
UPDATE employee2 SET name='Tharun' WHERE emp_id = 10015;
UPDATE employee2 SET email=CONCAT(LOWER(SUBSTRING_INDEX('Anjana', ' ', 1)), FLOOR(100 + (RAND() * 900)), '.nexus@gmail.com') WHERE emp_id = 10011;
UPDATE employee2 SET email=CONCAT(LOWER(SUBSTRING_INDEX('Suryansh', ' ', 1)), FLOOR(100 + (RAND() * 900)), '.nexus@gmail.com') WHERE emp_id = 10012;
UPDATE employee2 SET email=CONCAT(LOWER(SUBSTRING_INDEX('Akshat', ' ', 1)), FLOOR(100 + (RAND() * 900)), '.nexus@gmail.com') WHERE emp_id = 10013;
UPDATE employee2 SET email=CONCAT(LOWER(SUBSTRING_INDEX('Teja', ' ', 1)), FLOOR(100 + (RAND() * 900)), '.nexus@gmail.com') WHERE emp_id = 10014;
UPDATE employee2 SET email=CONCAT(LOWER(SUBSTRING_INDEX('Tharun', ' ', 1)), FLOOR(100 + (RAND() * 900)), '.nexus@gmail.com') WHERE emp_id = 10015;
SELECT * from employee2;
ALTER TABLE employee2  
ADD COLUMN phonenumber VARCHAR(15);
UPDATE employee2 SET phonenumber = CONCAT('9', FLOOR(RAND() * 1000000000)) WHERE emp_id = 10011;
UPDATE employee2 SET phonenumber = CONCAT('9', FLOOR(RAND() * 1000000000)) WHERE emp_id = 10012;
UPDATE employee2 SET phonenumber = CONCAT('9', FLOOR(RAND() * 1000000000)) WHERE emp_id = 10013;
UPDATE employee2 SET phonenumber = CONCAT('9', FLOOR(RAND() * 1000000000)) WHERE emp_id = 10014;
UPDATE employee2 SET phonenumber = CONCAT('9', FLOOR(RAND() * 1000000000)) WHERE emp_id = 10015;
CREATE TABLE leave_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    manager_id VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Approved', 'Denied') DEFAULT 'Pending'
);
select * from leave_requests;
CREATE TABLE customer_registration1 (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,  -- Matches 'accountHolderName'
    phone_no VARCHAR(15) UNIQUE NOT NULL,  -- Matches 'contactNumber'
    dob DATE NOT NULL,  -- Matches 'dob'
    nationality VARCHAR(100) NOT NULL,  -- Matches 'nationality'
    current_status VARCHAR(100) NOT NULL,  -- Matches 'Status'
    email VARCHAR(255) UNIQUE NOT NULL,  -- Matches 'mailingAddress'
    min_bal DECIMAL(10,2) NOT NULL,  -- Keep this for balance tracking
    verification_num VARCHAR(255) UNIQUE NOT NULL,  -- Matches 'documentnumber'
    document_type VARCHAR(50) NOT NULL,  -- New column for 'document' type
    branch VARCHAR(100) NOT NULL,  -- New column for 'branch'
    currency VARCHAR(10) NOT NULL,  -- New column for 'currency'
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,  -- Matches 'city'
    address VARCHAR(255) NOT NULL,  -- Renamed from 'street' to match 'address'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DELETE FROM customer_account3 ;
TRUNCATE TABLE transactions1 ;
TRUNCATE TABLE customer_registration1;
DELETE FROM customer_registration1;

select * from customer_registration1;
CREATE TABLE customer_account3 (
    account_number BIGINT PRIMARY KEY,  -- ✅ Ensures account_number is indexed
    customer_id INT UNIQUE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    account_type ENUM('Savings', 'Current') NOT NULL,
    ifsc_code VARCHAR(15) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer_registration1(customer_id) ON DELETE CASCADE
);


select * from customer_account3;
SELECT * FROM customer_account3 WHERE account_number = '1300062998';

ALTER TABLE customer_account3 
ADD COLUMN password VARCHAR(15);
ALTER TABLE customer_account MODIFY account_number BIGINT;

CREATE TABLE transactions1 (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    account_number BIGINT,
    transaction_type ENUM('Deposit', 'Withdraw', 'Transfer') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_number) REFERENCES customer_account3(account_number) ON DELETE CASCADE
);
ALTER TABLE transactions1
ADD COLUMN releated_account BIGINT;
select * from transactions1;
CREATE TABLE loan_requests (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    account_number INT,
    amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    tenure INT NOT NULL,
    emi DECIMAL(15,2) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    FOREIGN KEY (account_number) REFERENCES customer_account(account_number) ON DELETE CASCADE
);

CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_no VARCHAR(15) UNIQUE NOT NULL,
    role ENUM('Loan Officer', 'Branch Manager', 'Cashier') NOT NULL
);

CREATE TABLE loan_approvals (
    approval_id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT,  
    employee_id INT UNSIGNED,  -- Match employee2(emp_id) type
    approval_status ENUM('Approved', 'Rejected') NOT NULL,
    approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loan_requests(loan_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employee2(emp_id) ON DELETE CASCADE
);