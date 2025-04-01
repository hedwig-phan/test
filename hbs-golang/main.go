package main

import (
	"fmt"
	"io"
	"os"

	"github.com/aymerick/raymond"
)

func main() {
	workWithContext()
}

func quickStart() {
	tpl := `<div class="entry">
	<h1>{{title}}</h1>
	<div class="body">
	  {{body}}
	</div>
  </div>
  `

	ctx := map[string]string{
		"title": "My New Post",
		"body":  "This is my first post!",
	}

	result, err := raymond.Render(tpl, ctx)
	if err != nil {
		panic("Please report a bug :)")
	}

	fmt.Print(result)
}

func correctUsage() {
	source := `<div class="entry">
	<h1>{{title}}</h1>
	<div class="body">
	  {{body}}
	</div>
  </div>
  `

	ctxList := []map[string]string{
		{
			"title": "My New Post",
			"body":  "This is my first post!",
		},
		{
			"title": "Here is another post",
			"body":  "This is my second post!",
		},
	}

	// parse template
	tpl, err := raymond.Parse(source)
	if err != nil {
		panic(err)
	}

	for _, ctx := range ctxList {
		// render template
		result, err := tpl.Exec(ctx)
		if err != nil {
			panic(err)
		}

		fmt.Print(result)
	}

	/**
		You can use MustParse() and MustExec() functions if you don't want to deal with errors:
		// parse template
	tpl := raymond.MustParse(source)

	// render template
	result := tpl.MustExec(ctx)
		**/
}

func workWithContext() {
	source, err := readTemplateFile("hbs/template_1.hbs")
	if err != nil {
		panic(err)
	}

	type Person struct {
		FirstName string
		LastName  string
	}

	type Comment struct {
		Author Person
		Body   string `handlebars:"content"`
	}

	type Post struct {
		Author   Person
		Body     string
		Comments []Comment
	}

	ctx := Post{
		Person{"Jean", "Valjean"},
		"Life is difficult",
		[]Comment{
			Comment{
				Person{"Marcel", "Beliveau"},
				"LOL!",
			},
		},
	}

	output := raymond.MustRender(source, ctx)

	fmt.Print(output)
}

func readTemplateFile(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}

	return string(content), nil
}
