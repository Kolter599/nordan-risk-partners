/**
 * One-time migration endpoint. Reads docs/neon-init.sql and runs it
 * statement-by-statement against the connected Neon database. Idempotent —
 * safe to run multiple times.
 *
 * Protected by the admin cookie. Hit it from the /admin UI once the
 * connection is up.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import fs from "node:fs/promises";
import path from "node:path";

const COOKIE_NAME = "nrp_admin";

async function isAuthed(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === expected;
}

function splitStatements(sql: string): string[] {
  // Crude but adequate: split on semicolons that aren't inside $$...$$ blocks.
  // We don't have full SQL parsing — works for our hand-curated migration file.
  const out: string[] = [];
  let buf = "";
  let inDollar = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next2 = sql.slice(i, i + 2);
    if (next2 === "$$") {
      inDollar = !inDollar;
      buf += "$$";
      i++;
      continue;
    }
    if (ch === ";" && !inDollar) {
      const stmt = buf.trim();
      if (stmt) out.push(stmt);
      buf = "";
      continue;
    }
    buf += ch;
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

export async function POST() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 }
    );
  }

  let sqlText: string;
  try {
    const filePath = path.join(process.cwd(), "docs", "neon-init.sql");
    sqlText = await fs.readFile(filePath, "utf-8");
  } catch (err) {
    return NextResponse.json(
      { error: "Could not read migration file", detail: String(err) },
      { status: 500 }
    );
  }

  const sql = neon(process.env.DATABASE_URL);
  const statements = splitStatements(sqlText);
  const results: { ok: boolean; statement: string; error?: string }[] = [];

  for (const statement of statements) {
    try {
      // Strip leading comments before checking length
      const stripped = statement
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim();
      if (!stripped) {
        results.push({ ok: true, statement: "-- comment-only --" });
        continue;
      }
      // Use unsafe untagged execution for raw DDL; this endpoint is admin-only.
      await sql.query(statement);
      results.push({ ok: true, statement: stripped.slice(0, 80) });
    } catch (err) {
      results.push({
        ok: false,
        statement: statement.slice(0, 80),
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const failed = results.filter((r) => !r.ok);
  return NextResponse.json({
    ok: failed.length === 0,
    total: results.length,
    failedCount: failed.length,
    results,
  });
}
