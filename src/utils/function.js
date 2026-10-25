import { notify } from "./notify";

function to_message(error) {
    if (typeof error === "string") {
        return error;
    }

    if (error && typeof error === "object") {
        if (error.msg) {
            return String(error.msg);
        }
        if (error.message) {
            return String(error.message);
        }
        try {
            return JSON.stringify(error);
        } catch {
            return String(error);
        }
    }

    return String(error ?? "");
}

function show_error(error) {
    notify({
        severity: "Error",
        title: "出错了",
        message: to_message(error),
    });
}

function show_success(message) {
    notify({
        severity: "Success",
        title: "成功",
        message: to_message(message),
    });
}

function show_warning(message) {
    notify({
        severity: "Warning",
        title: "提示",
        message: to_message(message),
    });
}

export { show_error, show_success, show_warning };
