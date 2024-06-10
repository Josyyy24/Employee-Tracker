const mysql = require('mysql2');
const inquirer = require('inquirer');
const fs = require('fs');
const { join } = require('path');
const { FORMER } = require('dns');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employee_tracker_db'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log('Connected as id ' + connection.threadId);
    startTracker();
})

function startTracker() {
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all employees',
            'View all roles',
            'View all departments',
            'Add an employee',
            'Add a role',
            'Add a department',
            'Update an employee role',
            'Exit'
        ]
    }).then(function(answer) {
        switch (answer.action) {
            case 'View all employees':
                viewEmployees();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all departments':
                viewDepartments();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Exit':
                connection.end();
                break;
        }
    });
};

function viewEmployees() {
    const query =` 
    SELECT
        employee.id,
        employee.first_name,
        employee.last_name,
        role.title AS role,
        department.name AS department,
        role.salary,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM
        employee
    LEFT JOIN
        employee manager ON manager.id = employee.manager_id
    INNER JOIN
        role ON (role.id = employee.role_id)
    INNER JOIN
        department ON (department.id = role.department_id) ORDER BY employee.id;`

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        startTracker();
    });
};

function viewRoles() {
    const query = `SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department ON role.department_id = department.id;`

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        startTracker();
    });
};

function viewDepartments() {
    const query = `SELECT * FROM department;`

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        startTracker();
    });
};  

function addDepartment() {
    inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is the name of the department?'
    }).then(function(answer) {
        connection.query('INSERT INTO department SET ?', {
            name: answer.name
        }, function(err, res) {
            if (err) throw err;
            console.log('Department added');
            startTracker();
        });
    });
};

function addRole() {
    connection.query('SELECT * FROM department', function(err, res) {
        if (err) throw err;
        const departments = res.map(department => {
            return {
                name: department.name,
                value: department.id
            }
        });

        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the title of the role?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?'
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Which department does the role belong to?',
                choices: departments
            }
        ]).then(function(answer) {
            connection.query('INSERT INTO role SET ?', {
                title: answer.title,
                salary: answer.salary,
                department_id: answer.department_id
            }, function(err, res) {
                if (err) throw err;
                console.log('Role added');
                startTracker();
            });
        });
    });
};

function addEmployee() {
    connection.query('SELECT * FROM role', function(err, res) {
        if (err) throw err;
        const roles = res.map(role => {
            return {
                name: role.title,
                value: role.id
            }
        });

        connection.query('SELECT * FROM employee', function(err, res) {
            if (err) throw err;
            const employees = res.map(employee => {
                return {
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                }
            });

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: 'What is the first name of the employee?'
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: 'What is the last name of the employee?'
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'What is the role of the employee?',
                    choices: roles
                },
                {
                    type: 'list',
                    name: 'manager_id',
                    message: 'Who is the manager of the employee?',
                    choices: employees
                }
            ]).then(function(answer) {
                connection.query('INSERT INTO employee SET ?', {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    role_id: answer.role_id,
                    manager_id: answer.manager_id
                }, function(err, res) {
                    if (err) throw err;
                    console.log('Employee added');
                    startTracker();
                });
            });
        });
    });
}

function updateEmployeeRole() {
    connection.query('SELECT * FROM employee', function(err, res) {
        if (err) throw err;
        const employees = res.map(employee => {
            return {
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }
        });

        connection.query('SELECT * FROM role', function(err, res) {
            if (err) throw err;
            const roles = res.map(role => {
                return {
                    name: role.title,
                    value: role.id
                }
            });

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: 'Which employee would you like to update?',
                    choices: employees
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'What is the new role of the employee?',
                    choices: roles
                }
            ]).then(function(answer) {
                connection.query('UPDATE employee SET role_id = ? WHERE id = ?', [answer.role_id, answer.employee_id], function(err, res) {
                    if (err) throw err;
                    console.log('Employee role updated');
                    startTracker();
                });
            });
        });
    });
}