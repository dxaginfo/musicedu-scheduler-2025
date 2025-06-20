/**
 * Initial database schema migration
 */
exports.up = function(knex) {
  return knex.schema
    // Users table
    .createTable('users', function(table) {
      table.uuid('user_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.enum('role', ['admin', 'teacher', 'student', 'parent']).notNullable();
      table.string('phone_number');
      table.enum('status', ['active', 'inactive']).notNullable().defaultTo('active');
      table.timestamps(true, true);
    })
    
    // Teacher profiles
    .createTable('teacher_profiles', function(table) {
      table.uuid('teacher_profile_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.text('bio');
      table.specificType('instruments', 'text[]');
      table.string('teaching_experience');
      table.decimal('hourly_rate', 10, 2);
      table.integer('max_students');
      table.timestamps(true, true);
    })
    
    // Student profiles
    .createTable('student_profiles', function(table) {
      table.uuid('student_profile_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.string('instrument');
      table.string('skill_level');
      table.date('start_date');
      table.date('birth_date');
      table.text('notes');
      table.timestamps(true, true);
    })
    
    // Parent-child relationships
    .createTable('parent_child_relationships', function(table) {
      table.uuid('relationship_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('parent_user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.uuid('child_user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.string('relationship_type');
      table.timestamps(true, true);
      table.unique(['parent_user_id', 'child_user_id']);
    })
    
    // Teacher availability
    .createTable('teacher_availability', function(table) {
      table.uuid('availability_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('teacher_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.integer('day_of_week').notNullable(); // 0-6 for Sunday-Saturday
      table.time('start_time').notNullable();
      table.time('end_time').notNullable();
      table.boolean('recurring').notNullable().defaultTo(true);
      table.timestamps(true, true);
    })
    
    // Lesson types
    .createTable('lesson_types', function(table) {
      table.uuid('lesson_type_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.integer('duration').notNullable(); // in minutes
      table.integer('max_students');
      table.decimal('price', 10, 2);
      table.timestamps(true, true);
    })
    
    // Lessons
    .createTable('lessons', function(table) {
      table.uuid('lesson_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('teacher_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.uuid('lesson_type_id').notNullable().references('lesson_type_id').inTable('lesson_types').onDelete('RESTRICT');
      table.timestamp('start_time').notNullable();
      table.timestamp('end_time').notNullable();
      table.enum('status', ['scheduled', 'completed', 'cancelled']).notNullable().defaultTo('scheduled');
      table.enum('location_type', ['in-person', 'virtual']).notNullable();
      table.string('location_details');
      table.timestamps(true, true);
    })
    
    // Lesson participants
    .createTable('lesson_participants', function(table) {
      table.uuid('participant_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('lesson_id').notNullable().references('lesson_id').inTable('lessons').onDelete('CASCADE');
      table.uuid('student_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.enum('attendance_status', ['pending', 'present', 'absent', 'late', 'excused']).notNullable().defaultTo('pending');
      table.text('notes');
      table.timestamps(true, true);
      table.unique(['lesson_id', 'student_id']);
    })
    
    // Practice materials
    .createTable('practice_materials', function(table) {
      table.uuid('material_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('title').notNullable();
      table.text('description');
      table.string('file_url');
      table.uuid('created_by').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.timestamps(true, true);
    })
    
    // Student materials (assignments)
    .createTable('student_materials', function(table) {
      table.uuid('assignment_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('student_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.uuid('material_id').notNullable().references('material_id').inTable('practice_materials').onDelete('CASCADE');
      table.timestamp('assigned_date').notNullable();
      table.timestamp('due_date');
      table.enum('completion_status', ['assigned', 'in-progress', 'completed', 'reviewed']).notNullable().defaultTo('assigned');
      table.text('feedback');
      table.timestamps(true, true);
      table.unique(['student_id', 'material_id']);
    })
    
    // Progress records
    .createTable('progress_records', function(table) {
      table.uuid('record_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('student_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.uuid('teacher_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.date('date').notNullable();
      table.specificType('skills_assessed', 'text[]');
      table.integer('performance_rating');
      table.text('comments');
      table.text('next_goals');
      table.timestamps(true, true);
    })
    
    // Notifications
    .createTable('notifications', function(table) {
      table.uuid('notification_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
      table.uuid('related_entity_id');
      table.string('entity_type');
      table.text('message').notNullable();
      table.enum('type', ['reminder', 'update', 'cancellation']).notNullable();
      table.enum('delivery_method', ['email', 'sms', 'in-app']).notNullable();
      table.enum('status', ['pending', 'sent', 'failed']).notNullable().defaultTo('pending');
      table.timestamp('scheduled_time');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('notifications')
    .dropTableIfExists('progress_records')
    .dropTableIfExists('student_materials')
    .dropTableIfExists('practice_materials')
    .dropTableIfExists('lesson_participants')
    .dropTableIfExists('lessons')
    .dropTableIfExists('lesson_types')
    .dropTableIfExists('teacher_availability')
    .dropTableIfExists('parent_child_relationships')
    .dropTableIfExists('student_profiles')
    .dropTableIfExists('teacher_profiles')
    .dropTableIfExists('users');
};
