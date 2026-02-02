import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

// This will work with both Supabase, Neon, and MySQL databases
// The user just needs to connect their preferred database

let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, position, hourlyRate, startDate } = body

    // Check if database is configured
    const isSupabase = !!process.env.SUPABASE_URL
    const isNeon = !!process.env.DATABASE_URL
    const isMySQL = !!process.env.MYSQL_HOST

    if (!isSupabase && !isNeon && !isMySQL) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Please connect Supabase, Neon, or MySQL from the Connect section in the sidebar.",
        },
        { status: 500 },
      )
    }

    if (isSupabase) {
      // Use Supabase
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

      const { data, error } = await supabase
        .from("restaurant_workers")
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            position,
            hourly_rate: Number.parseFloat(hourlyRate),
            start_date: startDate,
          },
        ])
        .select()

      if (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ worker: data[0] }, { status: 201 })
    } else if (isNeon) {
      // Use Neon
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(process.env.DATABASE_URL!)

      const result = await sql`
        INSERT INTO restaurant_workers (first_name, last_name, email, phone, position, hourly_rate, start_date)
        VALUES (${firstName}, ${lastName}, ${email}, ${phone}, ${position}, ${Number.parseFloat(hourlyRate)}, ${startDate})
        RETURNING *
      `

      return NextResponse.json({ worker: result[0] }, { status: 201 })
    } else if (isMySQL) {
      const connection = await getPool().getConnection()

      const [result] = await connection.execute(
        `INSERT INTO restaurant_workers (first_name, last_name, email, phone, position, hourly_rate, start_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, email, phone, position, Number.parseFloat(hourlyRate), startDate],
      )

      const insertId = (result as mysql.ResultSetHeader).insertId
      const [workers] = await connection.execute(`SELECT * FROM restaurant_workers WHERE id = ?`, [insertId])

      connection.release()

      return NextResponse.json({ worker: (workers as any[])[0] }, { status: 201 })
    }
  } catch (error) {
    console.error("Error adding worker:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add worker" },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Check if database is configured
    const isSupabase = !!process.env.SUPABASE_URL
    const isNeon = !!process.env.DATABASE_URL
    const isMySQL = !!process.env.MYSQL_HOST

    if (!isSupabase && !isNeon && !isMySQL) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Please connect Supabase, Neon, or MySQL from the Connect section in the sidebar.",
          workers: [],
        },
        { status: 200 },
      )
    }

    if (isSupabase) {
      // Use Supabase
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

      const { data, error } = await supabase
        .from("restaurant_workers")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ error: error.message, workers: [] }, { status: 500 })
      }

      return NextResponse.json({ workers: data || [] })
    } else if (isNeon) {
      // Use Neon
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(process.env.DATABASE_URL!)

      const workers = await sql`
        SELECT * FROM restaurant_workers
        ORDER BY created_at DESC
      `

      return NextResponse.json({ workers })
    } else if (isMySQL) {
      const connection = await getPool().getConnection()

      const [workers] = await connection.execute(`SELECT * FROM restaurant_workers ORDER BY created_at DESC`)

      connection.release()

      return NextResponse.json({ workers })
    }
  } catch (error) {
    console.error("Error fetching workers:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch workers", workers: [] },
      { status: 500 },
    )
  }
}
