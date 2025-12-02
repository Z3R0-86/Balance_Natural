import type { User, DailyRecord, FoodItem } from "./types"

const USER_KEY = "nutritionTracker_currentUser"
const USERS_INDEX_KEY = "nutritionTracker_users"

function getRecordsKey(userId: string): string {
  return `nutritionTracker_records_${userId}`
}

function getUserDataKey(userId: string): string {
  return `nutritionTracker_user_${userId}`
}

export function getUserByName(name: string): User | null {
  try {
    const usersIndex = getAllUsers()
    const userEntry = usersIndex.find((u) => u.name.toLowerCase() === name.toLowerCase())

    if (!userEntry) return null

    const userDataKey = getUserDataKey(userEntry.id)
    const userData = localStorage.getItem(userDataKey)

    if (userData) {
      return JSON.parse(userData)
    }

    return null
  } catch (error) {
    console.error("Error finding user:", error)
    return null
  }
}

export function userNameExists(name: string): boolean {
  try {
    const usersIndex = getAllUsers()
    return usersIndex.some((u) => u.name.toLowerCase() === name.toLowerCase())
  } catch (error) {
    console.error("Error checking username:", error)
    return false
  }
}

export function saveUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    const userDataKey = getUserDataKey(user.id)
    localStorage.setItem(userDataKey, JSON.stringify(user))

    const usersIndex = getAllUsers()
    const existingIndex = usersIndex.findIndex((u) => u.id === user.id)

    if (existingIndex !== -1) {
      usersIndex[existingIndex] = {
        id: user.id,
        name: user.name,
        createdAt: usersIndex[existingIndex].createdAt,
        lastAccess: new Date().toISOString(),
      }
    } else {
      usersIndex.push({
        id: user.id,
        name: user.name,
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
      })
    }

    localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(usersIndex))
  } catch (error) {
    console.error("Error saving user:", error)
  }
}

export function getUser(): User | null {
  try {
    const data = localStorage.getItem(USER_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export function getAllUsers(): Array<{ id: string; name: string; createdAt: string; lastAccess: string }> {
  try {
    const data = localStorage.getItem(USERS_INDEX_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error getting users:", error)
    return []
  }
}

export function clearUser(): void {
  try {
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error("Error clearing user:", error)
  }
}

export function saveDailyRecord(record: DailyRecord, userId: string): void {
  try {
    const recordsKey = getRecordsKey(userId)
    const records = getAllRecords(userId)
    const existingIndex = records.findIndex((r) => r.date === record.date)

    if (existingIndex !== -1) {
      records[existingIndex] = record
    } else {
      records.push(record)
    }

    localStorage.setItem(recordsKey, JSON.stringify(records))
  } catch (error) {
    console.error("Error saving record:", error)
  }
}

export function getDailyRecord(date: string, userId: string): DailyRecord | null {
  try {
    const records = getAllRecords(userId)
    return records.find((r) => r.date === date) || null
  } catch (error) {
    console.error("Error getting record:", error)
    return null
  }
}

export function getAllRecords(userId: string): DailyRecord[] {
  try {
    const recordsKey = getRecordsKey(userId)
    const data = localStorage.getItem(recordsKey)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error getting records:", error)
    return []
  }
}

export function getLastNRecords(n: number, userId: string): DailyRecord[] {
  try {
    const records = getAllRecords(userId)
    return records.slice(-n).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error("Error getting last records:", error)
    return []
  }
}

export function clearAllData(): void {
  try {
    const usersIndex = getAllUsers()
    usersIndex.forEach((user) => {
      localStorage.removeItem(getRecordsKey(user.id))
      localStorage.removeItem(getUserDataKey(user.id))
    })
    localStorage.removeItem(USERS_INDEX_KEY)
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error("Error clearing data:", error)
  }
}

// --- Custom foods per user -------------------------------------------------
function getUserFoodsKey(userId: string): string {
  return `nutritionTracker_userFoods_${userId}`
}

export function getUserFoods(userId: string): FoodItem[] {
  try {
    const key = getUserFoodsKey(userId)
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error getting user foods:", error)
    return []
  }
}

export function saveUserFood(userId: string, food: FoodItem): void {
  try {
    const key = getUserFoodsKey(userId)
    const existing = getUserFoods(userId)
    const idx = existing.findIndex((f) => f.id === food.id)
    if (idx !== -1) {
      existing[idx] = food
    } else {
      existing.push(food)
    }
    localStorage.setItem(key, JSON.stringify(existing))
  } catch (error) {
    console.error("Error saving user food:", error)
  }
}

export function removeUserFood(userId: string, foodId: string): void {
  try {
    const key = getUserFoodsKey(userId)
    const existing = getUserFoods(userId)
    const filtered = existing.filter((f) => f.id !== foodId)
    localStorage.setItem(key, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error removing user food:", error)
  }
}
