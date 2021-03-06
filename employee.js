const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
  host: 'localhost',

  port: 3306,

  user: 'root',

  password: 'Computer_01',
  database: 'employee_trackerDB',
});

connection.connect((err) => {
  if (err) throw err;
  runSearch();
});

const runSearch = () => {
  inquirer
    .prompt({
      name: 'action',
      type: 'rawlist',
      message: 'What would you like to do?',
      choices: [
        'Add department',
        'Add role',
        'Add employee',
        'View departments',
        'View roles',
        'View employees',
        'View employees by Manager',
        'Update employee roles',
        'Update employee manager',
        'Delete role',
        'Delete department',
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case 'Add department':
          addDepartment();
          break;

        case 'Add role':
          addRole();
          break;

        case 'Add employee':
          addEmployee();
          break;

        case 'View departments':
          viewDepts();
          break;

        case 'View roles':
          viewRoles();
          break;

        case 'View employees':
          viewEmployees();
          break;

        case 'View employees by Manager':
          viewEmpByManager();
          break;

        case 'Update employee roles':
          updateEmployeeRole();
          break;

        case 'Update employee manager':
          updateEmployeeManager();
          break;

        case 'Delete role':
          deleteRole();
          break;

        case 'Delete department':
          deleteDept();
          break;

        default:
          console.log(`Invalid action: ${answer.action}`);
          break;
      }
    });
};

// View departments
const viewDepts = () => {
  const query = 'SELECT name AS Department FROM department';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runSearch();
  });
};

// View roles
const viewRoles = () => {
  const query = 'SELECT title FROM role';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runSearch();
  });
};

// View employees 
const viewEmployees = () => {
  const query = 'SELECT employee.first_name, employee.last_name, title, salary, name, CONCAT (emp.first_name, " ", emp.last_name) AS Manager FROM employee INNER JOIN employee AS emp ON employee.manager_id =  emp.id INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runSearch();
  });

};

// View employees by Manager
const viewEmpByManager = () => {
  const query = 'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee';
  connection.query(query, (err, res) => {
    inquirer
      .prompt([
        {
          name: 'managerName',
          type: 'list',
          message: `Select manager's name`,
          choices: res
        },
      ])
      .then((answer) => {
        //console.log(res);
        var managerId = res.find((manager) => {
          return answer.managerName === manager.name;
        });
        //console.log("managerID: ", managerId);
        const query = 'SELECT first_name, last_name, title, name FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE ?';

        var managerlist = {
          manager_id: managerId.id,
        };
        connection.query(query, managerlist, (err, res) => {
          if (err) throw err;
          console.log("Employees by manager:", managerId.name);
          console.table(res);
          runSearch();
        });

      });
  });
};

// Add a department 
const addDepartment = () => {

  inquirer
    .prompt([
      {
        name: 'departmentName',
        type: 'input',
        message: 'Enter the name of the department'
      },
    ])
    .then((answer) => {

      const query = 'INSERT INTO department SET ?';
      const newDept = {
        name: answer.departmentName,
      };
      console.log("answer: ", answer);
      connection.query(query, newDept, (err, res) => {
        if (err) throw err;
        console.log("New Department has been added");
        runSearch();
      });

    });
};

// Add roles to the database
const addRole = () => {
  const query = 'SELECT * FROM department';

  connection.query(query, (err, res) => {
    inquirer
      .prompt([
        {
          name: 'title',
          type: 'input',
          message: 'What is the title of the role?'
        },
        {
          name: 'salary',
          type: 'input',
          message: 'What is the salary?'
        },
        {
          name: 'department_id',
          type: 'list',
          message: 'What is the department ID?',
          choices: res
        },
      ])
      .then((answer) => {
        var objId = res.find((department) => {
          return answer.department_id === department.name;
        });

        const query = 'INSERT INTO role SET ?';
        const newRole = {
          title: answer.title,
          salary: answer.salary,
          department_id: objId.id
        };
        connection.query(query, newRole, (err, res) => {
          if (err) throw err;
          console.log("New Role has been added");
          runSearch();
        });
      });
  });
};

// Add a new employee
const addEmployee = () => {
  var query1 = 'SELECT id, title AS name FROM role';
  connection.query(query1, (err, roles) => {
    var query2 = 'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee';
    connection.query(query2, (err, emps) => {
      inquirer
        .prompt([
          {
            name: 'firstName',
            type: 'input',
            message: `What is the employee's first name?`,
          },
          {
            name: 'lastName',
            type: 'input',
            message: `What is the employee's last name?`,
          },
          {
            name: 'roleId',
            type: 'list',
            message: `What is the employee's role`,
            choices: roles
          },
          {
            name: 'managerId',
            type: 'list',
            message: `Who is the employee's manager`,
            choices: emps
          },
        ]).then((answer) => {
          // console.log("answer: ", answer);

          var roleId = roles.find((role) => {
            return answer.roleId === role.name;
          });

          //console.log("roleId: ", roleId.id);

          var manager = emps.find((employee) => {
            return answer.managerId === employee.name;
          });

          // console.log("manager.id: ", manager.id);

          const query = 'INSERT INTO employee SET ?';
          const newEmp = {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: roleId.id,
            manager_id: manager.id,
          };

          connection.query(query, newEmp, (err, res) => {
            if (err) throw err;
            console.log('Employee has been added');
            runSearch();
          });
        });
    });
  });
};

// Update the role for an employee
const updateEmployeeRole = () => {
  var query1 = 'SELECT id, title AS name FROM role';
  connection.query(query1, (err, roles) => {
    var query2 = 'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee';
    connection.query(query2, (err, emps) => {
      inquirer
        .prompt([
          {
            name: 'employeeUpdate',
            type: 'list',
            message: 'Which employee do you want to update?',
            choices: emps
          },
          {
            name: 'newRole',
            type: 'list',
            message: 'What is the employees new role',
            choices: roles
          },
        ]).then((answer) => {
          console.log("answer: ", answer);

          var roleId = roles.find((role) => {
            return answer.newRole === role.name;
          });

          // console.log("roleId: ", roleId.id);

          var names = answer.employeeUpdate.split(' ');

          var names1 = names[0];
          var names2 = names[1];

          connection.query('UPDATE employee SET ? WHERE (? AND ?) ',
            [
              {
                role_id: roleId.id,
              },
              {
                first_name: names1,
              },
              {
                last_name: names2,
              },
            ],
            (err) => {
              if (err) throw err;
              console.log('Role has been updated');
              runSearch();
            }
          );
        });
    });
  });
};

// Update the manager for an employee
const updateEmployeeManager = () => {
  var query1 = 'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee';
  connection.query(query1, (err, managers) => {
    var query2 = 'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee';
    connection.query(query2, (err, emps) => {
      inquirer
        .prompt([
          {
            name: 'employeeUpdate',
            type: 'list',
            message: 'Which employee do you want to update?',
            choices: emps
          },
          {
            name: 'newManager',
            type: 'list',
            message: `Who is the employee's new manager`,
            choices: managers
          },
        ]).then((answer) => {
          console.log("answer: ", answer);

          var managerId = managers.find((manager) => {
            return answer.newManager === manager.name;
          });

          // console.log("roleId: ", roleId.id);

          var names = answer.employeeUpdate.split(' ');

          var names1 = names[0];
          var names2 = names[1];

          connection.query('UPDATE employee SET ? WHERE (? AND ?) ',
            [
              {
                manager_id: managerId.id,
              },
              {
                first_name: names1,
              },
              {
                last_name: names2,
              },
            ],
            (err) => {
              if (err) throw err;
              console.log('Manager has been updated');
              runSearch();
            }
          );
        });
    });
  });
};

// Delete a role
const deleteRole = () => {

  const query = 'SELECT id, title AS name FROM role';
  connection.query(query, (err, res) => {
    inquirer
      .prompt([
        {
          name: 'deleteRole',
          type: 'list',
          message: `Select employee to delete`,
          choices: res
        },
      ])
      .then((answer) => {
        //console.log(res);
        var deleteRole = res.find((role) => {
          return answer.deleteRole === role.name;
        });
        console.log(answer);
        console.log("deleteRole: ", deleteRole);
        connection.query(
          'DELETE FROM role WHERE ?',
          {
            id: deleteRole.id,
          },
          (err) => {
            if (err) throw err;
            console.log(`Role deleted!\n`);
            runSearch();
          }
        );


      });

  });

};

// Delete a department
const deleteDept = () => {
  const query = 'SELECT id, name AS name FROM department';
  connection.query(query, (err, res) => {
    inquirer
      .prompt([
        {
          name: 'deleteDept',
          type: 'list',
          message: `Select department to delete`,
          choices: res
        },
      ])
      .then((answer) => {
        //console.log(res);
        var delDpt = res.find((department) => {
          return answer.deleteDept === department.name;
        });
        console.log(answer);
        console.log("deleteDpt: ", delDpt);
        connection.query(
          'DELETE FROM department WHERE ?',
          {
            id: delDpt.id,
          },
          (err) => {
            if (err) throw err;
            console.log(`Department deleted!\n`);
            runSearch();
          }
        );


      });

  });

};