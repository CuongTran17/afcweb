import { useEffect, useState, useId } from "react";
import {
  Plus,
  Edit2,
  Star,
  Eye,
  EyeOff,
  Trash2,
  X,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AdminConfirmModal } from "../../components/admin/AdminConfirmModal";
import { ImageUploadField } from "../../components/admin/ImageUploadField";
import {
  createEvent,
  listAdminEvents,
  setEventStatus,
  toggleEventFeaturedHome,
  updateEvent,
  type EventImageInput,
} from "../../lib/content/adminContent";
import { getSupabaseClient } from "../../lib/supabase/client";
import type { SupabaseEventWithImages } from "../../lib/supabase/types";
import type { EventCategory } from "../../data/events";

export function EventAdminPage() {
  const [events, setEvents] = useState<SupabaseEventWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] =
    useState<SupabaseEventWithImages | null>(null);
  const [eventToArchive, setEventToArchive] =
    useState<SupabaseEventWithImages | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filterCategoryId = useId();
  const categoryId = useId();
  const monthId = useId();
  const contentId = useId();
  const statusId = useId();
  const featuredId = useId();

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("1");
  const [category, setCategory] = useState<EventCategory>("academic");
  const [label, setLabel] = useState("Học thuật");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageList, setImageList] = useState<
    Array<{
      url: string;
      storagePath?: string;
      alt?: string;
      fileSize?: number | null;
      mimeType?: string | null;
    }>
  >([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [featuredHome, setFeaturedHome] = useState(false);
  const [sortOrder, setSortOrder] = useState(1);
  const [status, setStatus] = useState<"draft" | "published" | "hidden">(
    "published",
  );

  const loadEvents = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      setIsLoading(true);
      const data = await listAdminEvents(supabase);
      setEvents(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách sự kiện.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle("");
    setSlug("");
    setYear(new Date().getFullYear().toString());
    setMonth(String(new Date().getMonth() + 1));
    setCategory("academic");
    setLabel("Học thuật");
    setSummary("");
    setContent("");
    setImageList([]);
    setNewImageUrl("");
    setFeaturedHome(false);
    setSortOrder(events.length + 1);
    setStatus("published");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (evt: SupabaseEventWithImages) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setSlug(evt.slug);
    setYear(evt.year);
    setMonth(evt.month || "1");
    setCategory(evt.category);
    setLabel(evt.label);
    setSummary(evt.summary);
    setContent(evt.content || "");
    const existingImgs = (evt.event_images || [])
      .filter((img) => img.status === "published")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        url: img.image_url,
        storagePath: img.storage_path,
        alt: img.alt || evt.title,
        fileSize: img.file_size,
        mimeType: img.mime_type,
      }));
    setImageList(existingImgs);
    setNewImageUrl("");
    setFeaturedHome(evt.featured_home);
    setSortOrder(evt.sort_order);
    setStatus(evt.status as any);
    setError(null);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingEvent) {
      // auto slug
      const auto = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(auto);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageList((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImageList((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const setCoverImage = (index: number) => {
    setImageList((prev) => {
      if (index <= 0) return prev;
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      return [selected, ...next];
    });
  };

  const updateImageAlt = (index: number, alt: string) => {
    setImageList((prev) =>
      prev.map((img, idx) => (idx === index ? { ...img, alt } : img)),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      setIsSaving(true);
      setError(null);

      const images: EventImageInput[] = imageList.map((img) => ({
        image_url: img.url,
        storage_path: img.storagePath || "events/manual_upload.jpg",
        alt: img.alt || title,
        file_size: img.fileSize ?? 102400,
        mime_type: img.mimeType || "image/jpeg",
      }));

      if (editingEvent) {
        await updateEvent(
          supabase,
          editingEvent.id,
          {
            title,
            slug,
            year,
            month,
            category,
            label,
            summary,
            content,
            featured_home: featuredHome,
            sort_order: sortOrder,
            status,
          },
          images,
        );
      } else {
        await createEvent(
          supabase,
          {
            title,
            slug,
            year,
            month,
            category,
            label,
            summary,
            content,
            featured_home: featuredHome,
            sort_order: sortOrder,
            status,
          },
          images,
        );
      }

      setIsModalOpen(false);
      await loadEvents();
    } catch (err: any) {
      setError(err?.message || "Lưu sự kiện thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFeatured = async (evt: SupabaseEventWithImages) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await toggleEventFeaturedHome(supabase, evt.id, !evt.featured_home);
      await loadEvents();
    } catch (err: any) {
      setError(err?.message || "Cập nhật nổi bật thất bại.");
    }
  };

  const handleToggleStatus = async (evt: SupabaseEventWithImages) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const nextStatus = evt.status === "published" ? "hidden" : "published";
    try {
      await setEventStatus(supabase, evt.id, nextStatus);
      await loadEvents();
    } catch (err: any) {
      setError(err?.message || "Cập nhật trạng thái thất bại.");
    }
  };

  const handleConfirmArchive = async () => {
    if (!eventToArchive) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      setIsArchiving(true);
      await setEventStatus(supabase, eventToArchive.id, "archived");
      setEventToArchive(null);
      await loadEvents();
    } catch (err: any) {
      setError(err?.message || "Thao tác bỏ sự kiện thất bại.");
    } finally {
      setIsArchiving(false);
    }
  };

  const filteredEvents = events.filter((e) =>
    filterCategory === "all" ? true : e.category === filterCategory,
  );

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">
              Quản lý Sự kiện & Dấu ấn Hoạt động
            </h2>
            <p className="admin-card__desc">
              Thêm bài viết hoạt động, tải ảnh sự kiện và chọn hiển thị ở mục
              Dấu ấn trang chủ.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="admin-btn admin-btn--primary"
          >
            <Plus size={16} />
            Thêm Sự kiện mới
          </button>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
          <label
            htmlFor={filterCategoryId}
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              alignSelf: "center",
            }}
          >
            Lọc theo thể loại:
          </label>
          <select
            id={filterCategoryId}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="admin-select"
            style={{ width: "auto" }}
          >
            <option value="all">Tất cả thể loại</option>
            <option value="academic">Học thuật (academic)</option>
            <option value="community">Đoàn Thanh Niên (community)</option>
            <option value="internal">Nội bộ (internal)</option>
          </select>
        </div>

        {error && (
          <div
            style={{
              color: "#dc2626",
              marginBottom: "1rem",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <div
            style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}
          >
            <Loader2
              size={24}
              className="animate-spin"
              style={{ margin: "0 auto" }}
            />
            <p style={{ marginTop: "0.5rem" }}>Đang tải danh sách sự kiện...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}
          >
            Chưa có sự kiện nào. Nhấn &quot;Thêm Sự kiện mới&quot; để tạo.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Ảnh</th>
                  <th style={{ width: "90px" }}>Số ảnh</th>
                  <th>Tên Sự kiện & Tóm tắt</th>
                  <th style={{ width: "90px" }}>Năm</th>
                  <th style={{ width: "110px" }}>Thể loại</th>
                  <th style={{ width: "130px", textAlign: "center" }}>
                    Nổi bật Home
                  </th>
                  <th style={{ width: "110px" }}>Trạng thái</th>
                  <th style={{ textAlign: "right", width: "140px" }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((evt) => (
                  <tr key={evt.id}>
                    <td>
                      {evt.event_images?.[0]?.image_url ? (
                        <img
                          src={evt.event_images[0].image_url}
                          alt={evt.title}
                          style={{
                            width: "56px",
                            height: "42px",
                            objectFit: "cover",
                            borderRadius: "0.25rem",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "56px",
                            height: "42px",
                            background: "#f1f5f9",
                            borderRadius: "0.25rem",
                          }}
                        />
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {evt.event_images?.filter(
                        (img) => img.status === "published",
                      ).length || 0}{" "}
                      ảnh
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {evt.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#64748b",
                          maxWidth: "400px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {evt.summary}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{evt.year}</td>
                    <td>
                      <span className="admin-badge admin-badge--hidden">
                        {evt.label || evt.category}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(evt)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: evt.featured_home ? "#eab308" : "#cbd5e1",
                        }}
                        title={
                          evt.featured_home
                            ? "Bỏ nổi bật trang chủ"
                            : "Ghim nổi bật trang chủ"
                        }
                      >
                        <Star
                          size={20}
                          fill={evt.featured_home ? "#eab308" : "none"}
                        />
                      </button>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          evt.status === "published"
                            ? "admin-badge--published"
                            : evt.status === "draft"
                              ? "admin-badge--draft"
                              : "admin-badge--hidden"
                        }`}
                      >
                        {evt.status === "published"
                          ? "Xuất bản"
                          : evt.status === "draft"
                            ? "Bản nháp"
                            : "Đang ẩn"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                        <Link
                          to={`/admin/events/${evt.slug}/preview`}
                          className="admin-btn admin-btn--secondary"
                          title="Xem trước"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(evt)}
                          className="admin-btn admin-btn--secondary"
                          title={
                            evt.status === "published"
                              ? "Ẩn khỏi web"
                              : "Hiển thị"
                          }
                        >
                          {evt.status === "published" ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(evt)}
                          className="admin-btn admin-btn--secondary"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEventToArchive(evt)}
                          className="admin-btn admin-btn--danger"
                          title="Bỏ khỏi web"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                {editingEvent ? "Chỉnh sửa Sự kiện" : "Thêm Sự kiện mới"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="admin-btn admin-btn--secondary"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div
                style={{
                  color: "#dc2626",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="admin-form-group">
                <label className="admin-label">Tiêu đề Sự kiện</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="admin-input"
                  placeholder="VD: Chung kết PTIT Trading Challenge"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Slug (đường dẫn)</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="admin-input"
                    placeholder="trading-challenge-2026"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Năm tổ chức</label>
                  <input
                    type="text"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="admin-input"
                    placeholder="2026"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor={monthId} className="admin-label">
                    Tháng tổ chức
                  </label>
                  <select
                    id={monthId}
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="admin-select"
                  >
                    {Array.from({ length: 12 }, (_, index) =>
                      String(index + 1),
                    ).map((value) => (
                      <option value={value} key={value}>
                        Tháng {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor={categoryId} className="admin-label">
                    Thể loại hoạt động
                  </label>
                  <select
                    id={categoryId}
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as EventCategory)
                    }
                    className="admin-select"
                  >
                    <option value="academic">Học thuật (academic)</option>
                    <option value="community">Đoàn Thanh Niên (community)</option>
                    <option value="internal">Nội bộ (internal)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Nhãn hiển thị (Label)</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="admin-input"
                    placeholder="Học thuật, Kết nối, Đào tạo..."
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tóm tắt nội dung</label>
                <textarea
                  rows={3}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="admin-textarea"
                  placeholder="Mô tả ngắn gọn về chương trình, dấu mốc đạt được..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor={contentId} className="admin-label">
                  Nội dung chi tiết
                </label>
                <textarea
                  id={contentId}
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="admin-textarea"
                  placeholder="Viết recap, mục tiêu, diễn biến chính và dấu ấn của sự kiện..."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">
                  Danh sách hình ảnh sự kiện ({imageList.length} ảnh)
                </label>
                {imageList.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {imageList.map((img, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.375rem",
                          overflow: "hidden",
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        <img
                          src={img.url}
                          alt={`Ảnh sự kiện ${idx + 1}`}
                          style={{
                            width: "100%",
                            height: "88px",
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{
                            padding: "0.5rem",
                            display: "grid",
                            gap: "0.45rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 600,
                                color: idx === 0 ? "#176f90" : "#64748b",
                              }}
                            >
                              {idx === 0 ? "Ảnh bìa" : `#${idx + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: "#dc2626",
                                padding: 0,
                              }}
                              title="Xóa ảnh này"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <input
                            aria-label={`Alt ảnh ${idx + 1}`}
                            value={img.alt || ""}
                            onChange={(e) =>
                              updateImageAlt(idx, e.target.value)
                            }
                            className="admin-input"
                            style={{
                              padding: "0.45rem 0.5rem",
                              fontSize: "0.75rem",
                            }}
                          />
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr auto auto",
                              gap: "0.35rem",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setCoverImage(idx)}
                              disabled={idx === 0}
                              className="admin-btn admin-btn--secondary"
                              aria-label={`Đặt ảnh ${idx + 1} làm ảnh bìa`}
                              style={{
                                padding: "0.45rem 0.5rem",
                                justifyContent: "center",
                              }}
                            >
                              Bìa
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(idx, -1)}
                              disabled={idx === 0}
                              className="admin-btn admin-btn--secondary"
                              aria-label={`Đưa ảnh ${idx + 1} lên trước`}
                              style={{
                                width: "34px",
                                height: "34px",
                                padding: 0,
                                justifyContent: "center",
                              }}
                            >
                              <ArrowUp size={13} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(idx, 1)}
                              disabled={idx === imageList.length - 1}
                              className="admin-btn admin-btn--secondary"
                              aria-label={`Đưa ảnh ${idx + 1} xuống sau`}
                              style={{
                                width: "34px",
                                height: "34px",
                                padding: 0,
                                justifyContent: "center",
                              }}
                            >
                              <ArrowDown size={13} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <ImageUploadField
                  label={
                    imageList.length === 0
                      ? "Tải ảnh bìa sự kiện (50KB - 500KB)"
                      : "Tải thêm ảnh cho sự kiện (50KB - 500KB)"
                  }
                  value={newImageUrl}
                  onChange={(url, meta) => {
                    if (url) {
                      setImageList((prev) => [
                        ...prev,
                        {
                          url,
                          storagePath: meta?.storagePath || "",
                          fileSize: meta?.fileSize || 60000,
                          mimeType: meta?.mimeType || "image/jpeg",
                          alt: title || "Ảnh sự kiện",
                        },
                      ]);
                      setNewImageUrl("");
                    }
                  }}
                  folder="events"
                  slug={slug || "event"}
                />
              </div>

              <div className="admin-form-row" style={{ alignItems: "center" }}>
                <div className="admin-form-group">
                  <label htmlFor={statusId} className="admin-label">
                    Trạng thái xuất bản
                  </label>
                  <select
                    id={statusId}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="admin-select"
                  >
                    <option value="published">Xuất bản ngay</option>
                    <option value="draft">Lưu nháp</option>
                    <option value="hidden">Ẩn khỏi web</option>
                  </select>
                </div>

                <div
                  className="admin-form-group"
                  style={{ marginTop: "1.25rem" }}
                >
                  <label
                    htmlFor={featuredId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    <input
                      id={featuredId}
                      type="checkbox"
                      checked={featuredHome}
                      onChange={(e) => setFeaturedHome(e.target.checked)}
                      style={{ width: "1.1rem", height: "1.1rem" }}
                    />
                    <span>Nổi bật trang chủ (Dấu ấn)</span>
                  </label>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="admin-btn admin-btn--secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="admin-btn admin-btn--primary"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminConfirmModal
        isOpen={Boolean(eventToArchive)}
        title="Bỏ sự kiện khỏi website?"
        message={`Bạn có chắc chắn muốn bỏ sự kiện "${eventToArchive?.title}" khỏi website? Toàn bộ hình ảnh và dữ liệu sẽ được chuyển vào lưu trữ an toàn thay vì xoá vĩnh viễn.`}
        confirmText="Bỏ khỏi website"
        confirmVariant="danger"
        isLoading={isArchiving}
        onConfirm={handleConfirmArchive}
        onCancel={() => setEventToArchive(null)}
      />
    </div>
  );
}
