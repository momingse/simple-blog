# Query in SQL (Oracle)

---

date: 08/07/2024
topics: sql oracle

---

## Background

I recently embarked on a journey into backend development, a field that I find both challenging and rewarding. As part of a new project I am working on, I am required to analyze data from multiple tables. This project, therefore, necessitates the execution of queries across these diverse tables, a task that I am eager to undertake and master.

## Query with in

Simply speaking, when we want to query data which certain column match some values we can use `IN`

```sql
SELECT *
FROM table1
WHERE col1 IN ('value1', 'value2')
```

And we can apply it nested.

```sql
SELECT *
FROM table2
WHERE table1_id IN (
SELECT table1_id
FROM table1
WHERE col1 IN ('value1', 'value2'))
```

## Query for the top one

Sometime we want to get the most recent value we can use `ROWNUM = ?`  and `ORDER BY ?`  .

```sql
SELECT *
FROM table1
WHERE col1 IN ('value1', 'value2')
AND ROWNUM = 1
ORDER BY create_time
```

## Pagination

Similar to top one, we can use `OFFSET ? ROWS`0 to define where we start and `FETCH NEXT ? ROW ONLY`  to define the page size.

```sql
SELECT *
FROM table1
WHERE col1 IN ('value1', 'value2')
OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY
```

## Query top item Partition By sth

### Why not `GROUP BY`

most of the time `GROUP BY` is used for some calculation like `MAX()` , `AVG()` . Although for top 1, we can use `GROUP BY` but we cannot do further modification.

### Implement using`PARTITION BY`

Here is the syntax for `PARTITION BY`

```sql
window_function ( expression ) OVER (
    PARTITION BY expression1, expression2, ...
    order_clause
    frame_clause
)
```

we can implement querying the top k item by added a `RANK()`  or `ROW_NUMBER()` . And Here is the example from [stackoverflow]([https://stackoverflow.com/questions/176964/select-top-10-records-for-each-category](https://stackoverflow.com/questions/176964/select-top-10-records-for-each-category)).

```sql
SELECT rs.Field1
    FROM (
        SELECT Field1, Rank() 
          over (Partition BY Section
                ORDER BY RankCriteria DESC ) AS Rank
        FROM table
        ) rs WHERE Rank <= 10
```

## Reference

- [**Paging with Oracle**]([https://stackoverflow.com/questions/241622/paging-with-oracle](https://stackoverflow.com/questions/241622/paging-with-oracle))
- [**Select top 10 records for each category](**[https://stackoverflow.com/questions/176964/select-top-10-records-for-each-category](https://stackoverflow.com/questions/176964/select-top-10-records-for-each-category))
