import { NextResponse } from "next/server"
import mysql from "mysql2/promise"
import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

let mysqlPool: mysql.Pool | null = null
let sqliteDb: Database.Database | null = null

function getSqliteDb() {
  if (!sqliteDb) {
    const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), "restaurant_workers.db")
    sqliteDb = new Database(dbPath)
    sqliteDb.pragma("journal_mode = WAL")
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS restaurant_workers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        position TEXT NOT NULL,
        hourly_rate REAL NOT NULL,
        start_date TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `)
  }
  return sqliteDb
}

function getMysqlPool() {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool({
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
  return mysqlPool
}

type DbType = "sqlite" | "supabase" | "neon" | "mysql"

function getDbType(): DbType {
  if (process.env.SQLITE_PATH) return "sqlite"
  if (process.env.SUPABASE_URL) return "supabase"
  if (process.env.DATABASE_URL) return "neon"
  if (process.env.MYSQL_HOST) return "mysql"
  return "sqlite"
}

const dbType = getDbType()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, position, hourlyRate, startDate } = body

    if (dbType === "supabase") {
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
    }

    if (dbType === "neon") {
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(process.env.DATABASE_URL!)

      const result = await sql`
        INSERT INTO restaurant_workers (first_name, last_name, email, phone, position, hourly_rate, start_date)
        VALUES (${firstName}, ${lastName}, ${email}, ${phone}, ${position}, ${Number.parseFloat(hourlyRate)}, ${startDate})
        RETURNING *
      `

      return NextResponse.json({ worker: result[0] }, { status: 201 })
    }

    if (dbType === "mysql") {
      const connection = await getMysqlPool().getConnection()

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

    // SQLite (default)
    const db = getSqliteDb()
    const stmt = db.prepare(`
      INSERT INTO restaurant_workers (first_name, last_name, email, phone, position, hourly_rate, start_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(firstName, lastName, email, phone, position, Number.parseFloat(hourlyRate), startDate)
    const worker = db.prepare("SELECT * FROM restaurant_workers WHERE id = ?").get(result.lastInsertRowid)

    return NextResponse.json({ worker }, { status: 201 })
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
    if (dbType === "supabase") {
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
    }

    if (dbType === "neon") {
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(process.env.DATABASE_URL!)

      const workers = await sql`
        SELECT * FROM restaurant_workers
        ORDER BY created_at DESC
      `

      return NextResponse.json({ workers })
    }

    if (dbType === "mysql") {
      const connection = await getMysqlPool().getConnection()

      const [workers] = await connection.execute(`SELECT * FROM restaurant_workers ORDER BY created_at DESC`)

      connection.release()

      return NextResponse.json({ workers })
    }

    // SQLite (default)
    const db = getSqliteDb()
    const workers = db.prepare("SELECT * FROM restaurant_workers ORDER BY created_at DESC").all()

    return NextResponse.json({ workers })
  } catch (error) {
    console.error("Error fetching workers:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch workers", workers: [] },
      { status: 500 },
    )
  }
}
