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
        'Add departments',
        'Add roles',
        'Add employees',
        'View departments',
        'View roles',
        'View employees',
        'Update employee roles',
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case 'Add departments':
          addDepartment();
          break;

        case 'Add roles':
          addRoles();
          break;

        case 'Add employees':
          //rangeSearch();
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

        case 'Update employee roles':
          updateEmployeeRole();
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
  const query = 'SELECT first_name, last_name FROM employee';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runSearch();
  });
};

const addDepartment = () => {
  // const query = 'SELECT * FROM department';

  // connection.query(query, (err, res) => {
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
  // });
}

// Add roles to the database
const addRoles = () => {
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
          console.log("Role has been added");
        });
        runSearch();
      });

  });
}

// Update an employee
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
              console.log('Role has been update');
            }
          );
          runSearch();
        });
    });
  });
}



const rangeSearch = () => {
  inquirer
    .prompt([
      {
        name: 'start',
        type: 'input',
        message: 'Enter starting position: ',
        validate(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        },
      },
      {
        name: 'end',
        type: 'input',
        message: 'Enter ending position: ',
        validate(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        },
      },
    ])
    .then((answer) => {
      const query =
        'SELECT position,song,artist,year FROM top5000 WHERE position BETWEEN ? AND ?';
      connection.query(query, [answer.start, answer.end], (err, res) => {
        res.forEach(({ position, song, artist, year }) => {
          console.log(
            `Position: ${position} || Song: ${song} || Artist: ${artist} || Year: ${year}`
          );
        });
        runSearch();
      });
    });
};

const songSearch = () => {
  inquirer
    .prompt({
      name: 'song',
      type: 'input',
      message: 'What song would you like to look for?',
    })
    .then((answer) => {
      console.log(answer.song);
      connection.query(
        'SELECT * FROM top5000 WHERE ?',
        { song: answer.song },
        (err, res) => {
          if (res[0]) {
            console.log(
              `Position: ${res[0].position} || Song: ${res[0].song} || Artist: ${res[0].artist} || Year: ${res[0].year}`
            );
          } else {
            console.error(`No results for ${answer.song}`);
          }
          runSearch();
        }
      );
    });
};

const songAndAlbumSearch = () => {
  inquirer
    .prompt({
      name: 'artist',
      type: 'input',
      message: 'What artist would you like to search for?',
    })
    .then((answer) => {
      let query =
        'SELECT top_albums.year, top_albums.album, top_albums.position, top5000.song, top5000.artist ';
      query +=
        'FROM top_albums INNER JOIN top5000 ON (top_albums.artist = top5000.artist AND top_albums.year ';
      query +=
        '= top5000.year) WHERE (top_albums.artist = ? AND top5000.artist = ?) ORDER BY top_albums.year, top_albums.position';

      connection.query(query, [answer.artist, answer.artist], (err, res) => {
        console.log(`${res.length} matches found!`);
        res.forEach(({ year, position, artist, song, album }, i) => {
          const num = i + 1;
          console.log(
            `${num} Year: ${year} Position: ${position} || Artist: ${artist} || Song: ${song} || Album: ${album}`
          );
        });

        runSearch();
      });
    });
};
