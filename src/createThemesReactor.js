// @flow
import type {CreateThemesReactor, StyleSheet, RawStyleSheet, Derivable} from './interfaces'

function themesReact(themes: Derivable<RawStyleSheet[]>, unmounted: Derivable<boolean>): void {
    let oldStyles: RawStyleSheet[] = []
    themes.react((newThemes: RawStyleSheet[]) => {
        for (let i = 0; i < oldStyles.length; i++) {
            oldStyles[i].__styles.detach()
        }
        for (let i = 0; i < newThemes.length; i++) {
            newThemes[i].__styles.attach()
        }
        oldStyles = newThemes
    }, {
        onStop() {
            for (let i = 0; i < oldStyles.length; i++) {
                oldStyles[i].__styles.detach()
            }
        },
        until: unmounted
    })
}

export default function createThemesReactorFactory(
    themes: Derivable<RawStyleSheet[]>
): CreateThemesReactor {
    return (unmounted: Derivable<boolean>) => {
        themesReact(themes, unmounted)
    }
}
