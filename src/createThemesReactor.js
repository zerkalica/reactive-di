// @flow
import type {CreateComponentReactor, StyleSheet, RawStyleSheet} from './interfaces/component'
import type {Derivable} from './interfaces/atom'

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

export default function CreateComponentReactorFactory(
    themes: Derivable<RawStyleSheet[]>
): CreateComponentReactor {
    return (unmounted: Derivable<boolean>) => {
        themesReact(themes, unmounted)
    }
}
