import { Trophy, CalendarDays, ListOrdered, Medal } from 'lucide-react'
import styles from './RankingExplainer.module.scss'

export default function RankingExplainer() {
  return <aside className={styles.panel} aria-labelledby="ranking-explainer-title">
    <span className={styles.eyebrow}>Entenda a classificação</span>
    <h3 id="ranking-explainer-title">Como funciona o ranking FEGEPI?</h3>
    <p>O ranking soma os pontos que cada time conquista nos campeonatos concluídos da sua modalidade e temporada.</p>
    <section className={styles.points}>
      <h4><Trophy size={17} /> Pontos por campeonato</h4>
      <dl>{[[1, 250], [2, 125], [3, 70], [4, 50]].map(([place, points]) => <div key={place}>
        <dt><span className={styles[`place${place}`]}>{place}º</span> lugar</dt><dd>{points}<small> pts</small></dd>
      </div>)}</dl>
      <p>Do 5º lugar em diante, a pontuação é zero.</p>
    </section>
    <div className={styles.rule}><CalendarDays size={19} /><div><h4>Uma temporada, vários campeonatos</h4><p>Os pontos de todas as etapas concluídas se acumulam. Rascunhos e campeonatos cancelados não pontuam.</p></div></div>
    <div className={styles.rule}><ListOrdered size={19} /><div><h4>Quem fica na frente?</h4><p>Vence a maior soma de pontos. Em caso de empate, fica à frente quem tem mais títulos; persistindo o empate, os times são ordenados pelo nome.</p></div></div>
    <div className={styles.rule}><Medal size={19} /><div><h4>Os últimos 5 campeonatos</h4><p>Da esquerda para a direita, do mais recente ao mais antigo. As cores mostram colocações do 1º ao 5º lugar. Cinza indica ausência, posição fora do top 5 ou uma etapa ainda não disponível.</p></div></div>
    <p className={styles.example}><strong>Por exemplo:</strong> um título + um 3º lugar = <b>320 pontos</b> na temporada.</p>
  </aside>
}
