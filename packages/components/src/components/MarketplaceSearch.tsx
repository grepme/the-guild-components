import React, { useMemo, useState } from 'react';

import { MarketplaceList } from './MarketplaceList';

import {
  Container,
  Results,
  Search,
  Title,
  Wrapper,
} from './MarketplaceSearch.styles';

import { IMarketplaceSearchProps } from '../types/components';
import { marketplaceThemedAssets } from '../helpers/assets';
import { useThemeContext } from '../helpers/theme';
import { Tag, TagsContainer } from './Tag';

export const MarketplaceSearch: React.FC<IMarketplaceSearchProps> = ({
  title,
  tagsFilter,
  placeholder,
  primaryList,
  secondaryList,
  queryList,
  ...restProps
}) => {
  const { isDarkTheme } = useThemeContext();
  const marketplaceAssets = marketplaceThemedAssets(isDarkTheme || false);
  const [query, setQuery] = useState<string>();

  const handleChange = (e: React.FormEvent<EventTarget>) => {
    const query = e.target as HTMLInputElement;
    setQuery(query.value);
  };

  const renderQueryPlaceholder = (
    placeholder: string | React.ReactElement,
    query: string | undefined
  ) => {
    if (!query || React.isValidElement(placeholder)) {
      return placeholder;
    }

    const subStrings = placeholder.split('{query}');
    return (
      <p>
        {subStrings[0]} <strong>{`"${query}"`}</strong> {subStrings[1]}
      </p>
    );
  };

  const items = useMemo(() => {
    let results = null;
    if (query && queryList) {
      const tagsFilter = (query || '')
        .split(' ')
        .filter((t) => t.trim().length > 1 && t.startsWith('#'));
      const queryWithoutTags =
        tagsFilter.length > 0
          ? query.replace(/#\w\w+\s?/g, '').toLowerCase()
          : query.toLowerCase();

      results = queryList.items.filter((item) => {
        const matchesContent = item.title
          .toLowerCase()
          .includes(queryWithoutTags);

        if (tagsFilter.length === 0) {
          return matchesContent;
        } else {
          return (
            item.tags?.some((tag) => tagsFilter.includes(`#${tag}`)) &&
            matchesContent
          );
        }
      });
    }

    return results;
  }, [query]);

  return (
    <Wrapper {...restProps.wrapperProps}>
      <Container {...restProps.containerProps}>
        <Title {...restProps.titleProps}>{title}</Title>
        {tagsFilter && (
          <TagsContainer>
            {tagsFilter.map((tagName) => (
              <Tag onClick={() => setQuery(`#${tagName}`)} key={tagName}>
                {tagName}
              </Tag>
            ))}
          </TagsContainer>
        )}
        <Search>
          <img
            src={marketplaceAssets.search}
            alt="Search"
            height="24"
            width="24"
          />
          <input
            value={query}
            type="search"
            placeholder={placeholder}
            onChange={handleChange}
            {...restProps.searchProps}
          />
        </Search>

        {items && queryList ? (
          <Results>
            <MarketplaceList
              title={queryList.title}
              items={items}
              placeholder={renderQueryPlaceholder(queryList.placeholder, query)}
              pagination={queryList.pagination}
              {...restProps.queryListProps}
            />
          </Results>
        ) : (
          <Results>
            <MarketplaceList {...primaryList} {...restProps.primaryListProps} />
            {secondaryList && (
              <MarketplaceList
                {...secondaryList}
                {...restProps.secondaryListProps}
              />
            )}
          </Results>
        )}
      </Container>
    </Wrapper>
  );
};
