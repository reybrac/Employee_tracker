INSERT INTO department (name)
VALUES ("HR");

INSERT INTO department (name)
VALUES ("Accounting");

INSERT INTO department (name)
VALUES ("Marketing");

INSERT INTO role (title, salary, department_id)
VALUES ("HR Manager","100,000", "1");

INSERT INTO role (title, salary, department_id)
VALUES ("Controller","120,000", "3");

INSERT INTO role (title, salary, department_id)
VALUES ("Accountant I","80,000", "3");

INSERT INTO role (title, salary, department_id)
VALUES ("Marketing manager","150,000", "2");

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Rey", "Brac", 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Smith", 3, 1);
