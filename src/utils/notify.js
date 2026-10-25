import { reactive } from "vue";

let nextId = 0;

/**
 * 应用内通知队列。界面由 App.vue 中的 InfoBar 渲染。
 */
export const notifications = reactive([]);

export function dismiss(id) {
    const index = notifications.findIndex((item) => item.id === id);
    if (index !== -1) {
        notifications.splice(index, 1);
    }
}

export function notify({ severity = "Informational", title = "", message = "", timeout } = {}) {
    const id = ++nextId;

    notifications.push({
        id,
        severity,
        title,
        message: String(message ?? ""),
    });

    // 错误提示保留更久，方便查看完整信息
    const delay = timeout ?? (severity === "Error" ? 8000 : 4000);
    if (delay > 0) {
        setTimeout(() => dismiss(id), delay);
    }

    // 最多同时保留 4 条
    while (notifications.length > 4) {
        notifications.shift();
    }

    return id;
}
