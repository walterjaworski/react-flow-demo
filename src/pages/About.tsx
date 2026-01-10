export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      <h1 className="text-2xl font-bold">About</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">🇧🇷 Português</h2>

        <p>
          Esta página é uma demonstração interativa construída com{" "}
          <strong>React Flow</strong>, uma biblioteca que permite criar e
          visualizar fluxos visuais — estruturas formadas por blocos (nodes)
          conectados entre si por relações (edges).
        </p>

        <p>
          Um <em>flow</em> pode representar diversos cenários do mundo real, como
          processos, decisões, integrações entre sistemas ou etapas de uma regra
          de negócio. Cada bloco representa uma etapa, e cada conexão indica o
          caminho ou resultado possível a partir dela.
        </p>

        <p>
          Este projeto nasceu como um exercício de aprendizado. Eu não conhecia a
          biblioteca até pouco tempo atrás, e a ideia da demo é mostrar a
          evolução do código ao longo do processo — explorando criação dinâmica
          de nodes, conexões condicionais, organização automática de layout e
          separação de responsabilidades.
        </p>

        <p>
          Mais do que o resultado final, esta demo reflete o processo de
          aprender, adaptar e aplicar boas práticas de engenharia de software,
          mesmo em um ambiente experimental.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">🇺🇸 English</h2>

        <p>
          This page is an interactive demonstration built with{" "}
          <strong>React Flow</strong>, a library that enables the creation and
          visualization of visual flows — structures composed of blocks (nodes)
          connected by relationships (edges).
        </p>

        <p>
          A <em>flow</em> can represent many real-world scenarios, such as
          processes, decisions, system integrations, or steps within a business
          rule. Each block represents a stage, while each connection indicates a
          possible path or outcome.
        </p>

        <p>
          This project started as a learning exercise. I was not familiar with
          the library until recently, and the goal of this demo is to show the
          evolution of the code throughout the process — exploring dynamic node
          creation, conditional connections, automatic layout organization, and
          proper separation of concerns.
        </p>

        <p>
          More than the final result, this demo reflects the process of learning,
          adapting, and applying software engineering best practices, even in an
          experimental environment.
        </p>
      </section>
    </div>
  );
}
