import { BAIInteractiveLoginFailureReason } from '../hooks/useBAIInteractiveLogin';
import { ButtonProps } from '@astryxdesign/core/Button';
export interface BAIInteractiveLoginButtonProps extends Omit<ButtonProps, 'label' | 'onClick' | 'clickAction' | 'isLoading'> {
    /** Absolute URL of the Backend.AI webserver, e.g. `https://webserver.example.com`. */
    webserverUrl: string;
    /** Name of the consuming application, shown on the provider page and in the failure copy. */
    appName: string;
    /** Absolute or relative URL the provider page returns to. Defaults to the current document URL. */
    callbackUrl?: string;
    timeoutMs?: number;
    /** Receives the webserver session id so the host can exchange it for its own credentials. */
    onSessionVerified: (sessionId: string) => void | Promise<void>;
    onFailure?: (reason: BAIInteractiveLoginFailureReason) => void;
    /**
     * Render the failure inline: an error alert for a real failure, a neutral
     * hint under the button for the ordinary `no_session` outcome.
     * @default true
     */
    showFailureAlert?: boolean;
    label?: string;
}
declare const BAIInteractiveLoginButton: ({ webserverUrl, appName, callbackUrl, timeoutMs, onSessionVerified, onFailure, showFailureAlert, label, variant, ...buttonProps }: BAIInteractiveLoginButtonProps) => import("react").JSX.Element;
export default BAIInteractiveLoginButton;
