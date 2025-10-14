const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://homework_user:homework_secure_password_123@localhost:5432/homework_system'
});

async function fixPasswords() {
  try {
    console.log('Generating bcrypt hash for password: admin123');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Generated hash:', hashedPassword);

    // Update all example users with the correct hash
    const users = [
      'admin@aibootcamp.edu',
      'instructor@aibootcamp.edu',
      'ta@aibootcamp.edu',
      'student@aibootcamp.edu'
    ];

    console.log('\nUpdating passwords in database...');

    for (const email of users) {
      const result = await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2 RETURNING email',
        [hashedPassword, email]
      );

      if (result.rows.length > 0) {
        console.log(`✓ Updated password for ${email}`);
      } else {
        console.log(`✗ User not found: ${email}`);
      }
    }

    console.log('\n✅ Password fix complete! All example users now have password: admin123');

    // Verify by checking one user
    console.log('\nVerifying password for admin@aibootcamp.edu...');
    const testResult = await pool.query(
      'SELECT email, password FROM users WHERE email = $1',
      ['admin@aibootcamp.edu']
    );

    if (testResult.rows.length > 0) {
      const isValid = await bcrypt.compare('admin123', testResult.rows[0].password);
      console.log('Password verification:', isValid ? '✓ SUCCESS' : '✗ FAILED');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixPasswords();
