const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Clear existing data
  await knex('notifications').del();
  await knex('progress_records').del();
  await knex('student_materials').del();
  await knex('practice_materials').del();
  await knex('lesson_participants').del();
  await knex('lessons').del();
  await knex('lesson_types').del();
  await knex('teacher_availability').del();
  await knex('parent_child_relationships').del();
  await knex('student_profiles').del();
  await knex('teacher_profiles').del();
  await knex('users').del();
  
  // Add users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);
  const parentPassword = await bcrypt.hash('parent123', 10);
  
  const [adminId] = await knex('users').insert({
    email: 'admin@example.com',
    password_hash: adminPassword,
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    status: 'active',
  }).returning('user_id');
  
  const [teacherId1] = await knex('users').insert({
    email: 'teacher1@example.com',
    password_hash: teacherPassword,
    first_name: 'Sarah',
    last_name: 'Johnson',
    role: 'teacher',
    phone_number: '555-123-4567',
    status: 'active',
  }).returning('user_id');
  
  const [teacherId2] = await knex('users').insert({
    email: 'teacher2@example.com',
    password_hash: teacherPassword,
    first_name: 'Michael',
    last_name: 'Williams',
    role: 'teacher',
    phone_number: '555-987-6543',
    status: 'active',
  }).returning('user_id');
  
  const [studentId1] = await knex('users').insert({
    email: 'student1@example.com',
    password_hash: studentPassword,
    first_name: 'Emily',
    last_name: 'Davis',
    role: 'student',
    status: 'active',
  }).returning('user_id');
  
  const [studentId2] = await knex('users').insert({
    email: 'student2@example.com',
    password_hash: studentPassword,
    first_name: 'James',
    last_name: 'Wilson',
    role: 'student',
    status: 'active',
  }).returning('user_id');
  
  const [parentId] = await knex('users').insert({
    email: 'parent@example.com',
    password_hash: parentPassword,
    first_name: 'Robert',
    last_name: 'Davis',
    role: 'parent',
    phone_number: '555-555-5555',
    status: 'active',
  }).returning('user_id');
  
  // Add teacher profiles
  await knex('teacher_profiles').insert({
    user_id: teacherId1,
    bio: 'Experienced piano and violin teacher with over 10 years of teaching experience.',
    instruments: ['Piano', 'Violin'],
    teaching_experience: '10+ years',
    hourly_rate: 50.00,
    max_students: 20,
  });
  
  await knex('teacher_profiles').insert({
    user_id: teacherId2,
    bio: 'Guitar and drums instructor specializing in contemporary music styles.',
    instruments: ['Guitar', 'Drums'],
    teaching_experience: '8 years',
    hourly_rate: 45.00,
    max_students: 15,
  });
  
  // Add student profiles
  await knex('student_profiles').insert({
    user_id: studentId1,
    instrument: 'Piano',
    skill_level: 'Intermediate',
    start_date: new Date('2023-01-15'),
    birth_date: new Date('2010-05-20'),
  });
  
  await knex('student_profiles').insert({
    user_id: studentId2,
    instrument: 'Guitar',
    skill_level: 'Beginner',
    start_date: new Date('2023-03-10'),
    birth_date: new Date('2012-11-08'),
  });
  
  // Add parent-child relationship
  await knex('parent_child_relationships').insert({
    parent_user_id: parentId,
    child_user_id: studentId1,
    relationship_type: 'Parent',
  });
  
  // Add teacher availability
  await knex('teacher_availability').insert([
    {
      teacher_id: teacherId1,
      day_of_week: 1, // Monday
      start_time: '09:00:00',
      end_time: '17:00:00',
      recurring: true,
    },
    {
      teacher_id: teacherId1,
      day_of_week: 3, // Wednesday
      start_time: '09:00:00',
      end_time: '17:00:00',
      recurring: true,
    },
    {
      teacher_id: teacherId1,
      day_of_week: 5, // Friday
      start_time: '09:00:00',
      end_time: '17:00:00',
      recurring: true,
    },
    {
      teacher_id: teacherId2,
      day_of_week: 2, // Tuesday
      start_time: '10:00:00',
      end_time: '18:00:00',
      recurring: true,
    },
    {
      teacher_id: teacherId2,
      day_of_week: 4, // Thursday
      start_time: '10:00:00',
      end_time: '18:00:00',
      recurring: true,
    },
  ]);
  
  // Add lesson types
  const [individualLessonTypeId] = await knex('lesson_types').insert({
    name: 'Individual Lesson',
    description: 'One-on-one instruction tailored to the student\'s specific needs.',
    duration: 30,
    max_students: 1,
    price: 30.00,
  }).returning('lesson_type_id');
  
  const [groupLessonTypeId] = await knex('lesson_types').insert({
    name: 'Group Lesson',
    description: 'Small group instruction for students of similar skill levels.',
    duration: 60,
    max_students: 5,
    price: 20.00,
  }).returning('lesson_type_id');
  
  await knex('lesson_types').insert({
    name: 'Ensemble Practice',
    description: 'Collaborative practice session for ensemble playing.',
    duration: 90,
    max_students: 10,
    price: 15.00,
  });
  
  // Add a few lessons
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [lessonId1] = await knex('lessons').insert({
    teacher_id: teacherId1,
    lesson_type_id: individualLessonTypeId,
    start_time: new Date(today.setHours(10, 0, 0, 0)),
    end_time: new Date(today.setHours(10, 30, 0, 0)),
    status: 'scheduled',
    location_type: 'in-person',
    location_details: 'Studio A',
  }).returning('lesson_id');
  
  const [lessonId2] = await knex('lessons').insert({
    teacher_id: teacherId2,
    lesson_type_id: groupLessonTypeId,
    start_time: new Date(tomorrow.setHours(15, 0, 0, 0)),
    end_time: new Date(tomorrow.setHours(16, 0, 0, 0)),
    status: 'scheduled',
    location_type: 'virtual',
    location_details: 'Zoom link will be sent 15 minutes before the lesson',
  }).returning('lesson_id');
  
  // Add lesson participants
  await knex('lesson_participants').insert([
    {
      lesson_id: lessonId1,
      student_id: studentId1,
      attendance_status: 'pending',
    },
    {
      lesson_id: lessonId2,
      student_id: studentId1,
      attendance_status: 'pending',
    },
    {
      lesson_id: lessonId2,
      student_id: studentId2,
      attendance_status: 'pending',
    },
  ]);
  
  // Add practice materials
  const [materialId1] = await knex('practice_materials').insert({
    title: 'Beginner Piano Scales',
    description: 'Basic scales for piano beginners to practice daily.',
    file_url: 'https://example.com/materials/piano-scales.pdf',
    created_by: teacherId1,
  }).returning('material_id');
  
  const [materialId2] = await knex('practice_materials').insert({
    title: 'Guitar Chord Progressions',
    description: 'Common chord progressions for beginners to practice.',
    file_url: 'https://example.com/materials/guitar-chords.pdf',
    created_by: teacherId2,
  }).returning('material_id');
  
  // Assign materials to students
  await knex('student_materials').insert([
    {
      student_id: studentId1,
      material_id: materialId1,
      assigned_date: new Date(),
      due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      completion_status: 'assigned',
    },
    {
      student_id: studentId2,
      material_id: materialId2,
      assigned_date: new Date(),
      due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      completion_status: 'assigned',
    },
  ]);
  
  console.log('Seed data inserted successfully');
};
