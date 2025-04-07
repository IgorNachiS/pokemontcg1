# Guia Pokémon TCG - App React Native

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)

Este app é um guia mobile para cartas de Pokémon TCG, feito com React Native e Expo. Com ele, você pode pesquisar cartas usando vários filtros, ver todos os detalhes e salvar suas favoritas.

## Recursos

* **Busca Detalhada:** Encontre cartas por Nome, Coleção (Set), Tipo, HP e Dano de ataque.
* **Info Completa:** Veja a imagem da carta, dados do set, raridade, tipo, HP, ataques (com custo, dano, descrição), fraquezas, resistências, custo para recuar, legalidade nos formatos e preços de mercado (via TCGplayer em USD).
* **Lista de Coleções:** Navegue pelas coleções disponíveis na API.
* **Favoritos:** Salve e gerencie suas cartas preferidas (usa AsyncStorage para guardar localmente).
* **Visual:** Interface com tema escuro, fonte Poppins e cores inspiradas em Pokémon.

## Tecnologias

* React Native (com Expo)
* Pokémon TCG API (pokemontcg.io)
* Expo Font, AsyncStorage, React Native Picker, React Native Community Slider

## O que precisa para rodar

* Node.js (LTS)
* npm ou yarn
* Expo CLI (`npm install --global expo-cli`)
* Git (opcional)
* Celular ou Emulador/Simulador (Android/iOS)
* App Expo Go (opcional, acelera o desenvolvimento)

## Como Rodar o Projeto

1.  **Clone:**
    ```bash
    git clone [https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git](https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git)
    cd NOME_DO_REPOSITORIO
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Instale libs do Expo:**
    ```bash
    npx expo install expo-font @react-native-async-storage/async-storage @react-native-picker/picker @react-native-community/slider
    ```

4.  **Configure a API Key:**
    * Pegue sua chave em [pokemontcg.io](https://pokemontcg.io/).
    * Crie um arquivo `.env` na raiz do projeto.
    * Adicione a linha: `EXPO_PUBLIC_POKEMON_TCG_API_KEY=SUA_CHAVE_API_AQUI`.
    * **Importante:** Adicione `.env` ao seu `.gitignore` para não enviar sua chave ao Git.

5.  **Adicione as Fontes:**
    * Crie a pasta `assets/fonts`.
    * Baixe os arquivos `.ttf` da fonte Poppins (Regular, Medium, SemiBold, Bold) e coloque lá.

6.  **Execute:**
    ```bash
    npx expo start
    ```
    * Siga as instruções do terminal para abrir no seu celular ou emulador.

## Utilizando o App

1.  Use os filtros no topo para buscar as cartas que deseja.
2.  Toque em "Search Cards".
3.  Os resultados aparecem abaixo; role a lista para ver mais.
4.  Toque numa carta para abrir a tela de detalhes.
5.  Na lista, toque na estrela (☆/★) para favoritar ou desfavoritar.
6.  Use "Clear Filters" para limpar a busca.

## Chave da API

É essencial ter uma chave válida da API `pokemontcg.io` configurada no arquivo `.env` para o app funcionar.

## Fontes

A fonte Poppins precisa estar corretamente instalada na pasta `assets/fonts` para que o visual do app fique como o esperado.
