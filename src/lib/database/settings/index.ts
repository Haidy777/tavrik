import { db } from '../db.js'
import type { SettingName, SettingsMap } from '../overrides.js'

export async function getSetting<K extends SettingName>(
  name: K
): Promise<SettingsMap[K]> {
  const row = await db
    .selectFrom('system.settings')
    .select('value')
    .where('name', '=', name)
    .executeTakeFirstOrThrow()

  return row.value as SettingsMap[K]
}

export async function setSetting<K extends SettingName>(
  name: K,
  value: SettingsMap[K]
): Promise<void> {
  await db
    .updateTable('system.settings')
    .set({ value })
    .where('name', '=', name)
    .execute()
}
