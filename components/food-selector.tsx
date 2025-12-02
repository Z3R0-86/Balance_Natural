"use client"

import { useEffect, useState } from "react"
import type { FoodItem } from "@/lib/types"
import { getCategoryLabel, FOOD_DATABASE, getFoodsForUser } from "@/lib/food-database"
import { getUser, saveUserFood, removeUserFood } from "@/lib/storage"

interface FoodSelectorProps {
  onAddFood: (food: FoodItem, quantity: number) => void
}

export function FoodSelector({ onAddFood }: FoodSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState("100")
  const [foods, setFoods] = useState<FoodItem[]>(FOOD_DATABASE)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newCalories, setNewCalories] = useState("100")
  const [newCategory, setNewCategory] = useState<FoodItem["category"]>("snacks")
  const [editingId, setEditingId] = useState<string | null>(null)

  const categories = ["all", "fruits", "proteins", "dairy", "grains", "vegetables", "beverages", "snacks"]

  const filteredFoods = foods.filter((food) => {
    const matchesCategory = selectedCategory === "all" || food.category === selectedCategory
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  useEffect(() => {
    const u = getUser()
    const list = getFoodsForUser(u?.id)
    setFoods(list)
    // reset selection if disappeared
    if (selectedFood) {
      const still = list.find((f) => f.id === selectedFood.id)
      if (!still) setSelectedFood(null)
    }
  }, [])

  const refreshFoods = () => {
    const u = getUser()
    const list = getFoodsForUser(u?.id)
    setFoods(list)
  }

  const handleCreateFood = () => {
    const user = getUser()
    if (!user) {
      alert("Debes iniciar sesión para añadir alimentos personalizados.")
      return
    }

    if (!newName || !newCalories) {
      alert("Rellena nombre y calorías por 100g.")
      return
    }

    // si editingId está presente, actualizamos; si no, creamos nuevo
    const id = editingId ?? `custom-${Date.now()}`
    const item: FoodItem = {
      id,
      name: newName.trim(),
      caloriesPer100g: Number.parseInt(newCalories),
      category: newCategory,
    }

    saveUserFood(user.id, item)
    setCreating(false)
    setEditingId(null)
    setNewName("")
    setNewCalories("100")
    refreshFoods()
  }

  const handleDeleteFood = (foodId: string) => {
    const user = getUser()
    if (!user) {
      alert("Debes iniciar sesión para eliminar alimentos personalizados.")
      return
    }

    if (!confirm("¿Eliminar este alimento personalizado?")) return

    removeUserFood(user.id, foodId)
    // si estaba seleccionado, limpiarlo
    if (selectedFood?.id === foodId) setSelectedFood(null)
    refreshFoods()
  }

  const startEditFood = (food: FoodItem) => {
    // llenar formulario de creación con datos existentes
    setCreating(true)
    setEditingId(food.id)
    setNewName(food.name)
    setNewCalories(String(food.caloriesPer100g))
    setNewCategory(food.category)
    // mantener scroll/selección
  }

  const handleAddFood = () => {
    if (selectedFood && quantity) {
      onAddFood(selectedFood, Number.parseInt(quantity))
      setSelectedFood(null)
      setQuantity("100")
      setSearchTerm("")
    }
  }

  return (
    <div className="space-y-4">
  {/* Buscar */}
      <div>
        <input
          type="text"
          placeholder="Buscar alimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
        />
      </div>

  {/* Filtro de categoría */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-border"
            }`}
          >
            {cat === "all" ? "Todos" : getCategoryLabel(cat)}
          </button>
        ))}
      </div>

  {/* Lista de alimentos */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredFoods.map((food) => {
          const isCustom = String(food.id).startsWith("custom-")
          return (
            <div
              key={food.id}
              className={`w-full p-3 rounded-lg border transition-colors flex items-center justify-between ${
                selectedFood?.id === food.id ? "bg-primary/10 border-primary" : "bg-card border-border hover:bg-muted"
              }`}
            >
              <div className="flex-1 text-left" onClick={() => setSelectedFood(food)}>
                <div className="flex justify-between">
                  <span className="font-medium">{food.name}</span>
                  <span className="text-sm text-muted-foreground">{food.caloriesPer100g} kcal/100g</span>
                </div>
              </div>

              {isCustom ? (
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => startEditFood(food)}
                    className="text-sm px-2 py-1 border border-border rounded-md bg-background text-foreground"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteFood(food.id)}
                    className="text-sm px-2 py-1 border border-border rounded-md bg-destructive/10 text-destructive"
                  >
                    Eliminar
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

  {/* Crear alimento personalizado */}
      <div className="pt-3">
        {creating ? (
          <div className="bg-card p-3 rounded-lg border border-border space-y-2">
            <input
              type="text"
              placeholder="Nombre del alimento"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newCalories}
                onChange={(e) => setNewCalories(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                placeholder="kcal por 100g"
              />

              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as FoodItem["category"])}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="snacks">Snacks</option>
                <option value="fruits">Frutas</option>
                <option value="proteins">Proteínas</option>
                <option value="dairy">Lácteos</option>
                <option value="grains">Granos</option>
                <option value="vegetables">Vegetales</option>
                <option value="beverages">Bebidas</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateFood} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg">
                Guardar alimento
              </button>
              <button onClick={() => setCreating(false)} className="flex-1 py-2 border border-border rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} className="w-full py-2 border border-border rounded-lg bg-muted text-muted-foreground">
            + Añadir alimento personalizado
          </button>
        )}
      </div>

  {/* Entrada de cantidad */}
      {selectedFood && (
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <div>
            <p className="font-medium mb-2">{selectedFood.name}</p>
            <p className="text-sm text-muted-foreground">{selectedFood.caloriesPer100g} kcal por 100g</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="Cantidad (g)"
            />
            <span className="text-sm text-muted-foreground">g</span>
          </div>

          <div className="text-sm font-medium text-primary">
            Total: {Math.round((Number.parseInt(quantity) / 100) * selectedFood.caloriesPer100g)} kcal
          </div>

          <button
            onClick={handleAddFood}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Agregar Alimento
          </button>
        </div>
      )}
    </div>
  )
}
