const mysql2 =require('mysql2')

const pool = mysql2.createPool({
    host: 'localhost',
    user:'nisha',
    password:'nisha',
    database:'HomelyBites_Simplified'
})

module.exports=pool