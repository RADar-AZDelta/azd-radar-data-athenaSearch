# @radar-azdelta/svelte-Athena-search

We have created a component where we can search the Athena database for concepts. The reason for this component is
so we can use this in other projects where we need to search the Athena database. The layout is based on the design
of the webtool from Athena so that the users will have a familiar experience. It uses the [@radar-azdelta/svelte-datatable package](https://www.npmjs.com/package/@radar-azdelta/svelte-datatable), which is an easy to use and fast table component.

## Features
- Filter on domain, vocabulary, ...
- Sorting
- Filtering
- Create a custom concept
- Bind custom actions to rows
- Can be used without configuration


## Usage
Install the package

```bash
pnpm install @radar-azdelta/svelte-athena-search
```

Add the component to a Svelte page

```svelte
<script lang="ts">
  import Search from '@radar-azdelta/svelte-Athena-search'
</script>

<Search />
```

## Example
See the [demo](https://radar-azdelta.github.io/svelte-Athena-search/) site

## Manual

### Properties

The Search component has one optional property: actionColumnCustom

```svelte
<Search actionColumnCustom={true}>
```

| Value | Description | Required | Default |
| ----- | ----------- | -------- | ------- |
| **actionColumnCustom** | show a extra column on the left side for actions | no | false |