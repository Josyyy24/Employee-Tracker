INSERT INTO department (name) VALUES
('Engineering'),
('Sales'),
('Finance'),
('Legal');

INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 100000, 1),
('Sales Lead', 80000, 2),
('Accountant', 70000, 3),
('Lawyer', 120000, 4);
( 'Salesperson', 60000, 2),
('Lead Engineer', 120000, 1),
('Account Manager', 80000, 3),
('Legal Team Lead', 250000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Mike', 'Chan', 2, 1),
('Ashley', 'Rodriguez', 3, 1),
('Kevin', 'Tupik', 4, 1),
('Kunal', 'Singh', 5, 2),
('Malia', 'Brown', 6, 3),
('Sarah', 'Lourd', 7, 4),
('Tom', 'Allen', 8, 4);