import styles from './GameArea.module.scss'

export default function GameArea() {
    return (
        <section className={styles.container}>
            <div className={styles.contentArea}>
                <div className={styles.imageArea}>
                    <img src="" alt="" />
                </div>

                <div className={styles.textContentArea}>
                    <h2>VALORANT</h2>
                    <p>Mais do que armas e munição, VALORANT inclui agentes com habilidades adaptativas, rápidas e letais, que criam oportunidades para você exibir sua mecânica de tiro. Cada Agente é único, assim como os momentos de destaque de cada partida!</p>
                </div>
            </div>
            <ul className={styles.numberContainer}>
                <li className={styles.numberArea}>
                    <p>de 27 á 31 de Outubro</p>
                    <h3>+ 10</h3>
                </li>
                <li className={styles.numberArea}>
                    <p>de 27 á 31 de Outubro</p>
                    <h3>+ 10</h3>
                </li>
                <li className={styles.numberArea}>
                    <p>de 27 á 31 de Outubro</p>
                    <h3>+ 10</h3>
                </li>
            </ul>
        </section>
    )
}