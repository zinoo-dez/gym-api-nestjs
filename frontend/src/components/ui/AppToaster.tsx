import { GoeyToaster } from "goey-toast";
import "goey-toast/styles.css";

export function AppToaster() {
    return (
        <GoeyToaster
            closeButton
            richColors
            position="bottom-right"
            preset="smooth"
            showProgress
        />
    );
}
