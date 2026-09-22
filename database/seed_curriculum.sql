-- Sample CBSE Class 9 curriculum: subjects, chapters, topics, and quiz questions.
-- Safe to load into any fresh database created from schema.sql.

INSERT INTO subjects (id, name, grade) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Mathematics', 9),
  ('11111111-0000-0000-0000-000000000002', 'Science', 9),
  ('11111111-0000-0000-0000-000000000003', 'Social Science', 9);

INSERT INTO chapters (id, subject_id, name, chapter_number) VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Number Systems', 1),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Polynomials', 2),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Coordinate Geometry', 3),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Linear Equations in Two Variables', 4),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', 'Matter in Our Surroundings', 1),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000002', 'Is Matter Around Us Pure', 2),
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000002', 'Atoms and Molecules', 3),
  ('22222222-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000002', 'The Fundamental Unit of Life', 4),
  ('22222222-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000003', 'The French Revolution', 1),
  ('22222222-0000-0000-0000-00000000000a', '11111111-0000-0000-0000-000000000003', 'Physical Features of India', 2);

INSERT INTO topics (id, chapter_id, name, difficulty) VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Irrational Numbers', 'medium'),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 'Laws of Exponents for Real Numbers', 'hard'),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'Zeroes of a Polynomial', 'medium'),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', 'Factorisation of Polynomials', 'hard'),
  ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000003', 'The Cartesian Plane', 'easy'),
  ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000004', 'Graph of a Linear Equation', 'medium'),
  ('33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000005', 'States of Matter', 'easy'),
  ('33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000005', 'Evaporation', 'medium'),
  ('33333333-0000-0000-0000-000000000009', '22222222-0000-0000-0000-000000000006', 'Types of Mixtures', 'easy'),
  ('3333333a-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000007', 'Laws of Chemical Combination', 'hard'),
  ('3333333a-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000008', 'Cell Organelles', 'medium'),
  ('3333333a-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000009', 'Causes of the French Revolution', 'medium'),
  ('3333333a-0000-0000-0000-000000000004', '22222222-0000-0000-0000-00000000000a', 'The Himalayas', 'easy');

-- Mathematics: Irrational Numbers
INSERT INTO quiz_questions (topic_id, question_text, options, correct_option, difficulty) VALUES
('33333333-0000-0000-0000-000000000001', 'Which of the following is an irrational number?',
 '{"A": "√4", "B": "√9", "C": "√2", "D": "0.5"}', 'C', 'medium'),
('33333333-0000-0000-0000-000000000001', 'π (pi) is:',
 '{"A": "A rational number", "B": "An irrational number", "C": "An integer", "D": "A natural number"}', 'B', 'easy'),
('33333333-0000-0000-0000-000000000001', 'The decimal expansion of an irrational number is:',
 '{"A": "Terminating", "B": "Non-terminating and recurring", "C": "Non-terminating and non-recurring", "D": "Always negative"}', 'C', 'medium'),
('33333333-0000-0000-0000-000000000001', 'Which of these is a rational number?',
 '{"A": "√2", "B": "22/7", "C": "√3", "D": "√5"}', 'B', 'medium'),
('33333333-0000-0000-0000-000000000001', 'Between any two rational numbers there:',
 '{"A": "is no rational number", "B": "is exactly one irrational number", "C": "are infinitely many irrational numbers", "D": "is no irrational number"}', 'C', 'hard');

-- Science: States of Matter
INSERT INTO quiz_questions (topic_id, question_text, options, correct_option, difficulty) VALUES
('33333333-0000-0000-0000-000000000007', 'Which state of matter has a definite shape and definite volume?',
 '{"A": "Gas", "B": "Liquid", "C": "Solid", "D": "Plasma"}', 'C', 'easy'),
('33333333-0000-0000-0000-000000000007', 'The process of a liquid changing into a gas is called:',
 '{"A": "Condensation", "B": "Vaporisation", "C": "Freezing", "D": "Sublimation"}', 'B', 'medium'),
('33333333-0000-0000-0000-000000000007', 'Which state of matter has the strongest intermolecular force of attraction?',
 '{"A": "Gas", "B": "Liquid", "C": "Solid", "D": "All are equal"}', 'C', 'medium'),
('33333333-0000-0000-0000-000000000007', 'Sublimation is the change of state directly from:',
 '{"A": "Solid to liquid", "B": "Liquid to gas", "C": "Solid to gas", "D": "Gas to solid"}', 'C', 'medium'),
('33333333-0000-0000-0000-000000000007', 'The SI unit of temperature is:',
 '{"A": "Celsius", "B": "Fahrenheit", "C": "Kelvin", "D": "Joule"}', 'C', 'easy');

-- Social Science: The Himalayas
INSERT INTO quiz_questions (topic_id, question_text, options, correct_option, difficulty) VALUES
('3333333a-0000-0000-0000-000000000004', 'The Himalayas are an example of which type of mountains?',
 '{"A": "Fold mountains", "B": "Block mountains", "C": "Volcanic mountains", "D": "Residual mountains"}', 'A', 'medium'),
('3333333a-0000-0000-0000-000000000004', 'The southernmost range of the Himalayas is known as:',
 '{"A": "Greater Himalayas", "B": "Middle Himalayas", "C": "Shiwaliks", "D": "Trans-Himalayas"}', 'C', 'medium'),
('3333333a-0000-0000-0000-000000000004', 'Which is the highest peak of the Himalayas located in India?',
 '{"A": "K2", "B": "Kangchenjunga", "C": "Nanda Devi", "D": "Anamudi"}', 'B', 'hard'),
('3333333a-0000-0000-0000-000000000004', 'The Himalayas run west to east roughly from the Indus river to which river?',
 '{"A": "Brahmaputra", "B": "Yamuna", "C": "Narmada", "D": "Godavari"}', 'A', 'medium'),
('3333333a-0000-0000-0000-000000000004', 'Which Himalayan range lies closest to the Indo-Gangetic plain?',
 '{"A": "Trans-Himalayas", "B": "Greater Himalayas", "C": "Lesser Himalayas", "D": "Shiwaliks"}', 'D', 'easy');
