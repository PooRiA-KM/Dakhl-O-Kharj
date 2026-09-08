"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CategoryForm from "@/components/categories/CategoryForm";
import CategoryList from "@/components/categories/CategoryList";
import { useAuth } from "@/hooks/useAuth";
import {
  Category,
  deleteCategory,
  getCategories,
} from "@/services/categoryService";

export default function CategoriesPage() {
  const { loading: authLoading } = useAuth(true);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await getCategories();
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (category: Category) => {
    const ok = window.confirm(
      `دسته‌بندی «${category.name}» حذف شود؟\nتراکنش‌های آن بدون دسته‌بندی باقی می‌مانند.`
    );

    if (!ok) return;

    const res = await deleteCategory(category.id);

    if (res.error) {
      window.alert(res.error);
      return;
    }

    fetchCategories();
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditing(null);
    fetchCategories();
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-800">دسته‌بندی‌ها</h1>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            + دسته‌بندی جدید
          </button>
        </div>

        {(showForm || editing) && (
          <div className="mb-6">
            <CategoryForm
              initial={editing}
              onSuccess={handleSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        )}

        <CategoryList
          categories={categories}
          onEdit={(c) => {
            setShowForm(false);
            setEditing(c);
          }}
          onDelete={handleDelete}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}