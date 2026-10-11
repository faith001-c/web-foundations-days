-- School database: students, courses and enrolments
PRAGMA foreign_keys = ON;

-- Start clean so the script can be run again
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- 1. Tables
CREATE TABLE students (
  student_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  course_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title     TEXT NOT NULL,
  credits   INTEGER NOT NULL
);

-- Join table: one row = one student enrolled on one course
CREATE TABLE enrolments (
  enrolment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id   INTEGER NOT NULL,
  course_id    INTEGER NOT NULL,
  grade        INTEGER CHECK (grade BETWEEN 0 AND 100),
  FOREIGN KEY (student_id) REFERENCES students (student_id),
  FOREIGN KEY (course_id) REFERENCES courses (course_id),
  UNIQUE (student_id, course_id)
);

-- 2. Sample data
INSERT INTO students (name, email) VALUES
  ('Amina Wanjiru', 'amina@example.com'),
  ('Brian Otieno', 'brian@example.com'),
  ('Cynthia Mwangi', 'cynthia@example.com'),
  ('David Kamau', 'david@example.com'),
  ('Esther Njeri', 'esther@example.com');

INSERT INTO courses (title, credits) VALUES
  ('Web Development', 4),
  ('Databases', 3),
  ('Data Structures', 4);

INSERT INTO enrolments (student_id, course_id, grade) VALUES
  (1, 1, 85),
  (1, 2, 78),
  (2, 1, 92),
  (2, 3, 70),
  (3, 2, 67),
  (3, 3, 74),
  (4, 1, 58);

-- 3. Queries

-- Query 1: all courses for one student (by name)
SELECT courses.title, courses.credits, enrolments.grade
FROM students
JOIN enrolments ON enrolments.student_id = students.student_id
JOIN courses ON courses.course_id = enrolments.course_id
WHERE students.name = 'Amina Wanjiru';

-- Query 2: all students on one course
SELECT students.name, students.email, enrolments.grade
FROM courses
JOIN enrolments ON enrolments.course_id = courses.course_id
JOIN students ON students.student_id = enrolments.student_id
WHERE courses.title = 'Web Development';

-- Query 3: number of students per course
SELECT courses.title, COUNT(enrolments.enrolment_id) AS student_count
FROM courses
LEFT JOIN enrolments ON enrolments.course_id = courses.course_id
GROUP BY courses.course_id, courses.title;

-- Query 4: students who have no enrolments
SELECT students.name, students.email
FROM students
LEFT JOIN enrolments ON enrolments.student_id = students.student_id
WHERE enrolments.enrolment_id IS NULL;

-- Query 5: update one enrolment's grade (Amina, Databases)
UPDATE enrolments
SET grade = 90
WHERE student_id = (SELECT student_id FROM students WHERE name = 'Amina Wanjiru')
  AND course_id = (SELECT course_id FROM courses WHERE title = 'Databases');

-- Check the update worked
SELECT students.name, courses.title, enrolments.grade
FROM enrolments
JOIN students ON students.student_id = enrolments.student_id
JOIN courses ON courses.course_id = enrolments.course_id
WHERE students.name = 'Amina Wanjiru';