// Base de datos de alimentos con alimentos comunes y sus valores calóricos
import type { FoodItem } from "./types"
import { getUserFoods } from "./storage"

export const FOOD_DATABASE: FoodItem[] = [
  // Proteínas
  { id: "1", name: "Pollo (pechuga)", caloriesPer100g: 165, category: "proteins" },
  { id: "2", name: "Pavo", caloriesPer100g: 135, category: "proteins" },
  { id: "3", name: "Huevos", caloriesPer100g: 155, category: "proteins" },
  { id: "4", name: "Atún", caloriesPer100g: 144, category: "proteins" },
  { id: "5", name: "Salmón", caloriesPer100g: 208, category: "proteins" },
  { id: "6", name: "Carne de res magra", caloriesPer100g: 250, category: "proteins" },

  // Frutas
  { id: "7", name: "Manzana", caloriesPer100g: 52, category: "fruits" },
  { id: "8", name: "Plátano", caloriesPer100g: 89, category: "fruits" },
  { id: "9", name: "Naranja", caloriesPer100g: 47, category: "fruits" },
  { id: "10", name: "Uvas", caloriesPer100g: 67, category: "fruits" },
  { id: "11", name: "Fresa", caloriesPer100g: 32, category: "fruits" },
  { id: "12", name: "Aguacate", caloriesPer100g: 160, category: "fruits" },

  // Verduras
  { id: "13", name: "Brócoli", caloriesPer100g: 34, category: "vegetables" },
  { id: "14", name: "Zanahorias", caloriesPer100g: 41, category: "vegetables" },
  { id: "15", name: "Lechuga", caloriesPer100g: 15, category: "vegetables" },
  { id: "16", name: "Tomate", caloriesPer100g: 18, category: "vegetables" },
  { id: "17", name: "Espinacas", caloriesPer100g: 23, category: "vegetables" },
  { id: "18", name: "Patata", caloriesPer100g: 77, category: "vegetables" },

  // Cereales
  { id: "19", name: "Arroz blanco", caloriesPer100g: 130, category: "grains" },
  { id: "20", name: "Pan integral", caloriesPer100g: 265, category: "grains" },
  { id: "21", name: "Pasta", caloriesPer100g: 131, category: "grains" },
  { id: "22", name: "Avena", caloriesPer100g: 389, category: "grains" },
  { id: "23", name: "Cereal", caloriesPer100g: 380, category: "grains" },

  // Lácteos
  { id: "24", name: "Leche descremada", caloriesPer100g: 34, category: "dairy" },
  { id: "25", name: "Yogur natural", caloriesPer100g: 61, category: "dairy" },
  { id: "26", name: "Queso", caloriesPer100g: 402, category: "dairy" },
  { id: "27", name: "Mantequilla", caloriesPer100g: 717, category: "dairy" },

  // Bebidas
  { id: "28", name: "Agua", caloriesPer100g: 0, category: "beverages" },
  { id: "29", name: "Refresco", caloriesPer100g: 42, category: "beverages" },
  { id: "30", name: "Jugo de naranja", caloriesPer100g: 45, category: "beverages" },
  { id: "31", name: "Café", caloriesPer100g: 0, category: "beverages" },

  // Aperitivos
  { id: "32", name: "Almendras", caloriesPer100g: 579, category: "snacks" },
  { id: "33", name: "Chocolate", caloriesPer100g: 535, category: "snacks" },
  { id: "34", name: "Papas fritas", caloriesPer100g: 536, category: "snacks" },
  { id: "35", name: "Galletas", caloriesPer100g: 471, category: "snacks" },
]

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    fruits: "Frutas",
    proteins: "Proteínas",
    dairy: "Lácteos",
    grains: "Granos",
    vegetables: "Vegetales",
    beverages: "Bebidas",
    snacks: "Snacks",
  }
  return labels[category] || category
}

// Devuelve la lista combinada de alimentos: base + personalizados del usuario
export function getFoodsForUser(userId?: string): FoodItem[] {
  if (!userId) return FOOD_DATABASE
  try {
    const custom = getUserFoods(userId) || []
    // custom items should not collide ids; ensure we return custom after base
    return [...FOOD_DATABASE, ...custom]
  } catch (error) {
    console.error("Error fetching foods for user:", error)
    return FOOD_DATABASE
  }
}
