const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
  host: 'localhost',

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: 'root',

  // Be sure to update with your own MySQL password!
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
          artistSearch();
          break;

        case 'Add roles':
          addRoles();
          break;

        case 'Add employees':
          rangeSearch();
          break;

        case 'View departments':
          viewDepts();
          break;

        case 'View roles':
          rangeSearch();
          break;

        case 'View employees':
          songSearch();
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

//First view query
const viewDepts = () => {
  const query = 'SELECT name AS Department FROM department';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
  });
};


const addRoles = () => {
  const query = 'SELECT * FROM department';
  //const query = "SELECT name AS Department FROM department";
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
      });
  });
}


const updateEmployeeRole = () => {
  var query1 = 'SELECT id, title AS name FROM role';
  connection.query(query1, (err, role) => {
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
            choices: role
          },
        ]).then((answer) => {
          console.log(answer);
        });
    });
  });
}

const artistSearch = () => {
  inquirer
    .prompt({
      name: 'artist',
      type: 'input',
      message: 'What artist would you like to search for?',
    })
    .then((answer) => {
      const query = 'SELECT position, song, year FROM top5000 WHERE ?';
      connection.query(query, { artist: answer.artist }, (err, res) => {
        res.forEach(({ position, song, year }) => {
          console.log(
            `Position: ${position} || Song: ${song} || Year: ${year}`
          );
        });
        runSearch();
      });
    });
};

const multiSearch = () => {
  const query =
    'SELECT artist FROM top5000 GROUP BY artist HAVING count(*) > 1';
  connection.query(query, (err, res) => {
    res.forEach(({ artist }) => console.log(artist));
    runSearch();
  });
};

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
