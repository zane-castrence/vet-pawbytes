import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/api";
import Modal from "./Modal";
import NotificationList, { timeAgo } from "./ui/notification-list";
import { Button } from "./ui/app-controls";
import { useToast } from "./ui/alert-stack";

const POLL_MS = 60000;

export default function NotificationCenter({ user }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await getNotifications());
    } catch {
      // keep what we already have; the next poll tries again
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (!document.hidden) load();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const close = useCallback(() => setOpen(false), []);
  const unread = items.filter((n) => !n.read).length;
  const destination = user?.role === "customer" ? "/my-appointments" : "/admin";

  const setRead = (id, read) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));

  const select = async (n) => {
    if (!n.read) {
      setRead(n.id, true);
      try {
        await markNotificationRead(user?.id, n.id);
      } catch {
        setRead(n.id, false);
        toast.error("Couldn't mark that notification as read.");
        return;
      }
    }
    setOpen(false);
    navigate(destination);
  };

  const markAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      load();
      toast.error("Couldn't mark all as read.");
    }
  };

  const viewAll = () => {
    setOpen(true);
    load();
  };

  return (
    <>
      <NotificationList items={items} unread={unread} onSelect={select} onViewAll={viewAll} />

      {open &&
        createPortal(
          <Modal
            title="Notifications"
            subtitle={unread ? `${unread} unread` : "You're all caught up."}
            onClose={close}
          >
            <div className="mb-4 flex justify-end">
              <Button variant="secondary" size="sm" onClick={markAll} disabled={unread === 0}>
                Mark all as read
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-[14px] text-[#4B5563]">No notifications yet.</p>
            ) : (
              <ul className="overflow-hidden rounded-[8px] border border-[#D8DEE3]">
                {items.map((n) => (
                  <li key={n.id} className="border-b border-[#D8DEE3] last:border-b-0">
                    <button
                      type="button"
                      onClick={() => select(n)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#EEF2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2A3BD9]"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.read ? "bg-transparent" : "bg-[#2A3BD9]"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span
                            className={`text-[14px] text-[#1F2937] ${
                              n.read ? "font-medium" : "font-bold"
                            }`}
                          >
                            {!n.read && <span className="sr-only">Unread. </span>}
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[12px] text-[#4B5563]">
                            {timeAgo(n.createdAt)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[13px] text-[#4B5563]">{n.message}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Modal>,
          document.body
        )}
    </>
  );
}
