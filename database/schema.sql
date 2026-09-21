-- CBSE Mastery Platform — PostgreSQL schema
-- 13 tables: users, students, parents, parent_student_links, schools,
-- subjects, chapters, topics, student_progress, quiz_questions,
-- quiz_attempts, quiz_attempt_answers, study_sessions

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('student', 'parent', 'admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE schools (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    city            VARCHAR(120),
    state           VARCHAR(120),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE students (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name       VARCHAR(255) NOT NULL,
    grade           SMALLINT CHECK (grade BETWEEN 6 AND 12),
    board           VARCHAR(20) NOT NULL DEFAULT 'CBSE',
    school_id       UUID REFERENCES schools(id) ON DELETE SET NULL,
    date_of_birth   DATE,
    onboarded_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE parents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE parent_student_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id       UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    relationship    VARCHAR(50) NOT NULL DEFAULT 'guardian',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (parent_id, student_id)
);

CREATE TABLE subjects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    grade           SMALLINT NOT NULL CHECK (grade BETWEEN 6 AND 12),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (name, grade)
);

CREATE TABLE chapters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    chapter_number  SMALLINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (subject_id, chapter_number)
);

CREATE TABLE topics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id      UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    difficulty      VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE student_progress (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    mastery_level   SMALLINT NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 100),
    last_studied_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, topic_id)
);

CREATE TABLE quiz_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    options         JSONB NOT NULL,
    correct_option  VARCHAR(10) NOT NULL,
    difficulty      VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quiz_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    score           SMALLINT,
    total_questions SMALLINT NOT NULL,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at    TIMESTAMPTZ
);

CREATE TABLE quiz_attempt_answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id      UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option VARCHAR(10),
    is_correct      BOOLEAN,
    answered_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE study_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    duration_minutes SMALLINT NOT NULL,
    session_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_parent_student_links_parent_id ON parent_student_links(parent_id);
CREATE INDEX idx_parent_student_links_student_id ON parent_student_links(student_id);
CREATE INDEX idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX idx_topics_chapter_id ON topics(chapter_id);
CREATE INDEX idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX idx_quiz_questions_topic_id ON quiz_questions(topic_id);
CREATE INDEX idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempt_answers_attempt_id ON quiz_attempt_answers(attempt_id);
CREATE INDEX idx_study_sessions_student_id ON study_sessions(student_id);
