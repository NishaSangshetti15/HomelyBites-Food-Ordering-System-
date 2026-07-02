const mysql = require('mysql')

// Database connection
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'w3_93020_Apurva',
  password: '2024@Apurva',
  database: 'HomelyBites_Simplified'
})

// Check and fix DeliveryPersonnel table
function fixDeliveryPersonnelTable() {
  console.log('🔍 Checking DeliveryPersonnel table structure...')

  // First, check if the table exists and has the password_hash column
  const checkTableQuery = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'HomelyBites_Simplified' 
    AND TABLE_NAME = 'DeliveryPersonnel'
  `

  pool.query(checkTableQuery, (err, columns) => {
    if (err) {
      console.error('❌ Error checking table:', err)
      process.exit(1)
    }

    const columnNames = columns.map(col => col.COLUMN_NAME)
    console.log('📋 Existing columns:', columnNames)

    // Check if password_hash column exists
    if (!columnNames.includes('password_hash')) {
      console.log('⚠️  password_hash column NOT found. Adding it...')
      
      const alterQuery = `
        ALTER TABLE DeliveryPersonnel 
        ADD COLUMN password_hash VARCHAR(255) AFTER phone_number
      `

      pool.query(alterQuery, (err) => {
        if (err) {
          console.error('❌ Error adding password_hash column:', err)
          process.exit(1)
        }
        console.log('✅ password_hash column added successfully!')
        verifyAndExit()
      })
    } else {
      console.log('✅ password_hash column already exists!')
      verifyAndExit()
    }
  })
}

function verifyAndExit() {
  // Final verification
  const verifyQuery = `DESCRIBE DeliveryPersonnel`
  pool.query(verifyQuery, (err, results) => {
    if (err) {
      console.error('❌ Verification failed:', err)
      process.exit(1)
    }
    
    console.log('\n📊 Final Table Structure:')
    console.table(results)
    console.log('\n✅ Database is ready for delivery person signup/signin!')
    process.exit(0)
  })
}

// Run the fix
fixDeliveryPersonnelTable()
